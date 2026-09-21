/**
 * WorldScene — orkestrator dunia data-driven (Phase 2).
 * Seluruh pembangunan dunia dilakukan oleh WorldBuilder; scene ini hanya
 * mengatur lifecycle: load peta → build → spawn player → camera → debug.
 * Pindah area memakai fade + scene.restart() (UIScene tetap berjalan).
 */

import { GameState, GAME_STATES } from "../core/GameState.js";
import { Config } from "../core/Config.js";
import { DebugState } from "../core/DebugState.js";
import { EventBus } from "../core/EventBus.js";
import { Player } from "../player/Player.js";
import { PlayerController } from "../player/PlayerController.js";
import { AudioManager } from "../audio/AudioManager.js";
import { MapManager } from "../map/MapManager.js";
import { WorldBuilder } from "../map/WorldBuilder.js";
import { AreaState } from "../map/AreaState.js";
import { NPCManager } from "../npc/NPCManager.js";

const FALLBACK_MAP = "desa_harmoni";

export class WorldScene extends Phaser.Scene {
  constructor() {
    super("WorldScene");
  }

  create(data) {
    GameState.set(GAME_STATES.CUTSCENE); // kunci pergerakan sampai world siap

    this._transitioning = false;
    this._cooldownUntil = 0;
    const urlMap = new URLSearchParams(window.location.search).get("map");
    this._requestedMap =
      (data && data.map) || urlMap || Config.WORLD.START_MAP;
    this._requestedSpawn = (data && data.spawn) || null;

    this.sorted = [];
    this._dbgPrev = { collision: null, grid: null, poi: null };

    this._buildLoadingPanel();

    AudioManager.play(Config.WORLD.AMBIENT);

    this._loadMap(this._requestedMap, this._requestedSpawn);
  }

  async _loadMap(mapId, spawn) {
    this._showLoading(mapId);
    let mapData;
    try {
      mapData = await MapManager.load(mapId);
    } catch (err) {
      console.error("[WorldScene] Gagal memuat peta:", mapId, err);
      if (mapId !== FALLBACK_MAP) {
        try {
          mapData = await MapManager.load(FALLBACK_MAP);
          spawn = null;
        } catch (fallbackErr) {
          this._hideLoading();
          this._showFatalError(fallbackErr);
          return;
        }
      } else {
        this._hideLoading();
        this._showFatalError(err);
        return;
      }
    }
    this._buildWorld(mapData, spawn);
  }

  _buildWorld(mapData, spawn) {
    const TILE = Config.TILE.SIZE;
    console.info(`[WorldScene] build start: ${mapData.id}`);
    const builder = new WorldBuilder(this);
    const built = builder.build(mapData);

    this.mapData = mapData;
    this.world = built;
    this.obstacles = built.obstacles;
    this.sorted = built.sorted;
    this.poiManager = built.pois;
    this.transitionManager = built.transitions;
    this.npcManager = new NPCManager(this, mapData.id);
    this.npcManager.spawnForMap();

    const { worldW, worldH } = built;
    this.physics.world.setBounds(0, 0, worldW, worldH, true, true, true, true);

    // spawn player
    const sp = spawn || mapData.spawn || { x: 4, y: 4 };
    this._ensurePlayer((sp.x + 0.5) * TILE, (sp.y + 0.5) * TILE);

    // collider: obstacle & air/water
    this.physics.add.collider(this.player, this.obstacles);
    this.physics.add.collider(this.player, built.waterLayer);

    // kontrol
    this.controller = new PlayerController(this.player, () => this._resolveInput());

    // transisi
    this.transitionManager.bindPlayer(this.player, (zone) => this._handleTransition(zone));

    // kamera
    this.cameras.main
      .setBounds(0, 0, worldW, worldH)
      .setZoom(Config.CAMERA.ZOOM)
      .startFollow(this.player, true, Config.CAMERA.LERP, Config.CAMERA.LERP);
    this.cameras.main.roundPixels = Config.CAMERA.ROUND_PIXELS;

    // grid debug (F8)
    this._buildGrid(worldW, worldH);

    // state area
    AreaState.markCurrent(mapData.id);
    AreaState.markVisited(mapData.id);
    DebugState.map = mapData.id;
    DebugState.area = mapData.name;
    DebugState.weather = (mapData.environment && mapData.environment.weather) || "clear";
    DebugState.tod = (mapData.environment && mapData.environment.tod) || "day";

    EventBus.emit("AREA_ENTERED", { mapId: mapData.id, name: mapData.name });

    this._hideLoading();
    this._cooldownUntil = this.time.now + Config.WORLD.POST_TRANSITION_COOLDOWN_MS;
    this.cameras.main.fadeIn(Config.WORLD.FADE_IN_MS, 0, 0, 0);

    GameState.set(GAME_STATES.PLAYING);
    console.info(`[WorldScene] build done -> PLAYING: ${mapData.id}`);
  }

  update(time, delta) {
    const input = this._resolveInput();

    let interactPressed = false;
    if (this.controller) interactPressed = this.controller.update(time, delta);
    if (this.player) {
      this.player.update(time);
      this.player.setDepth(this.player.y);
    }

    this._ySortObjects();
    this._updateInteraction(interactPressed);
    this._applyDebugFlags();

    // DebugState
    if (this.player) {
      DebugState.px = this.player.x;
      DebugState.py = this.player.y;
      DebugState.pState = this.player.state.value;
      DebugState.facing = this.player.facing;
    }
    if (input) {
      const v = input.getVector();
      DebugState.input = { x: v.x, y: v.y };
    }
  }

  _ySortObjects() {
    const list = this.sorted;
    for (let i = list.length - 1; i >= 0; i--) {
      const o = list[i];
      if (!o || !o.active) {
        list.splice(i, 1);
        continue;
      }
      o.setDepth(o.y);
    }
  }

  _updateInteraction(interactPressed) {
    if (!this.player) return;
    // Prioritas 1: NPC terdekat (dialog desa) sebelum POI.
    const npc = this.npcManager ? this.npcManager.nearest(
      this.player.x,
      this.player.y,
      Config.NPC.INTERACT_RADIUS
    ) : null;

    if (npc) {
      if (this._focusedPoi) this._focusedPoi = null;
      if (this._focusedNpc !== npc) {
        this._focusedNpc = npc;
        this._showInteractMarkerNpc(npc);
      }
      if (interactPressed) {
        EventBus.emit("DIALOGUE_STARTED", { npc: npc.data });
      }
      return;
    }
    if (this._focusedNpc) {
      this._focusedNpc = null;
      this._hideInteractMarkerNpc();
      EventBus.emit("DIALOGUE_COMPLETED", {});
    }

    const nearby = this.poiManager.getNearest(
      this.player.x,
      this.player.y,
      Config.WORLD.INTERACT_RADIUS
    );

    if (nearby) {
      if (this._focusedPoi !== nearby) {
        this._focusedPoi = nearby;
        this._showInteractMarker(nearby);
      }
      if (interactPressed) {
        EventBus.emit("POI_INTERACTED", { poi: nearby.data });
      }
    } else if (this._focusedPoi) {
      this._focusedPoi = null;
      this._hideInteractMarker();
    }
  }

  _showInteractMarkerNpc(npc) {
    if (!this._interactMarker) {
      this._interactMarker = this.add
        .image(npc.x, npc.y - 52, "interact_marker")
        .setDepth(9100)
        .setScale(0.85);
      this._interactMarkerText = this.add
        .text(npc.x, npc.y - 68, "[ E ] Bicara", {
          fontFamily: Config.UI.FONT_FAMILY,
          fontSize: "11px",
          fontStyle: "bold",
          color: "#ffffff",
          backgroundColor: "#c0392bcc",
          padding: { x: 4, y: 2 },
        })
        .setOrigin(0.5)
        .setDepth(9101);
    } else {
      this._interactMarker.setPosition(npc.x, npc.y - 52);
      this._interactMarkerText.setPosition(npc.x, npc.y - 68);
    }
    this._interactMarkerText.setText("[ E ] Bicara");
    this._interactMarker.setVisible(true);
    this._interactMarkerText.setVisible(true);
  }

  _hideInteractMarkerNpc() {
    this._hideInteractMarker();
  }

  _showInteractMarker(poi) {
    if (!this._interactMarker) {
      this._interactMarker = this.add
        .image(poi.x, poi.y - 44, "interact_marker")
        .setDepth(9100)
        .setScale(0.85);
      this._interactMarkerText = this.add
        .text(poi.x, poi.y - 60, "[ E ]", {
          fontFamily: Config.UI.FONT_FAMILY,
          fontSize: "11px",
          fontStyle: "bold",
          color: "#ffffff",
          backgroundColor: "#c0392bcc",
          padding: { x: 4, y: 2 },
        })
        .setOrigin(0.5)
        .setDepth(9101);
    } else {
      this._interactMarker.setPosition(poi.x, poi.y - 44);
      this._interactMarkerText.setPosition(poi.x, poi.y - 60);
    }
    this._interactMarkerText.setText("[ E ]");
    this._interactMarker.setVisible(true);
    this._interactMarkerText.setVisible(true);
  }

  _hideInteractMarker() {
    if (this._interactMarker) {
      this._interactMarker.setVisible(false);
      this._interactMarkerText.setVisible(false);
    }
  }

  _handleTransition(zone) {
    if (this._transitioning) return false;
    if (this.time.now < this._cooldownUntil) return false;

    this._transitioning = true;
    GameState.set(GAME_STATES.CUTSCENE);

    if (this.player) this.player.disable();
    if (this.controller) this.controller = null;
    this._hideInteractMarker();

    this._showLoading(zone.label || zone.target, "Pindah area...");
    this.cameras.main.fadeOut(Config.WORLD.TRANSITION_MS, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.scene.restart({ map: zone.target, spawn: zone.targetSpawn });
    });
    return true;
  }

  _applyDebugFlags() {
    const d = DebugState;
    if (this._dbgPrev.collision !== d.showCollision) {
      this._dbgPrev.collision = d.showCollision;
      this.physics.world.drawDebug = d.showCollision;
      if (this.transitionManager) this.transitionManager.setZonesVisible(d.showCollision);
    }
    if (this._dbgPrev.grid !== d.showGrid) {
      this._dbgPrev.grid = d.showGrid;
      if (this._grid) this._grid.setVisible(d.showGrid);
    }
    if (this._dbgPrev.poi !== d.showPOI) {
      this._dbgPrev.poi = d.showPOI;
      if (this.poiManager) this.poiManager.setMarkersVisible(d.showPOI);
    }
  }

  _ensurePlayer(x, y) {
    if (!this.player) {
      this.player = new Player(this, x, y);
    } else {
      this.player.setPosition(x, y);
      this.player.setVelocity(0, 0);
      this.player.enable();
    }
    this.player.setDepth(this.player.y);
  }

  _resolveInput() {
    if (this._input) return this._input;
    const ui = this.scene.get("UIScene");
    if (ui && typeof ui.getInputManager === "function") {
      this._input = ui.getInputManager();
    }
    return this._input || null;
  }

  // ============ overlay: loading / grid / error ============

  _buildLoadingPanel() {
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    this._loading = this.add
      .container(0, 0)
      .setScrollFactor(0)
      .setDepth(9950)
      .setVisible(false);

    const dim = this.add.rectangle(
      cx,
      cy,
      this.scale.width,
      this.scale.height,
      0x000000,
      0.55
    );
    const g = this.add.graphics();
    g.fillStyle(0xfdf6e3, 1);
    g.fillRoundedRect(cx - 190, cy - 72, 380, 144, 14);
    g.lineStyle(2, 0xc0392b, 0.7);
    g.strokeRoundedRect(cx - 190, cy - 72, 380, 144, 14);

    this._loadingTitle = this.add
      .text(cx, cy - 24, "", {
        fontFamily: Config.UI.FONT_FAMILY,
        fontSize: "26px",
        fontStyle: "bold",
        color: "#c0392b",
      })
      .setOrigin(0.5);

    this._loadingSub = this.add
      .text(cx, cy + 24, "Loading...", {
        fontFamily: Config.UI.FONT_FAMILY,
        fontSize: "15px",
        color: "#2c2c2c",
      })
      .setOrigin(0.5);

    this._loading.add([dim, g, this._loadingTitle, this._loadingSub]);
  }

  _showLoading(title, sub) {
    this._loadingTitle.setText(String(title || "").toUpperCase());
    if (sub) this._loadingSub.setText(sub);
    else this._loadingSub.setText("Loading...");
    this._loading.setVisible(true);
  }

  _hideLoading() {
    this._loading.setVisible(false);
  }

  _buildGrid(w, h) {
    const T = Config.TILE.SIZE;
    const g = this.add.graphics().setDepth(5000).setVisible(false);
    g.lineStyle(1, 0xffffff, 0.07);
    for (let x = 0; x <= w; x += T) g.lineBetween(x, 0, x, h);
    for (let y = 0; y <= h; y += T) g.lineBetween(0, y, w, y);
    this._grid = g;
  }

  _showFatalError(err) {
    GameState.set(GAME_STATES.MAIN_MENU);
    console.error("[WorldScene] Fatal:", err);
  }
}