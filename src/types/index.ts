import { MOB_TYPES } from '@airbattle/protocol';
import { Polygon } from 'collisions';
import { WebSocket } from 'uWebSockets.js';
import { CONNECTIONS_STATUS } from '../constants';
import { User } from './entities';

export interface HitboxCacheItem {
  width: number;
  height: number;
  x: number;
  y: number;
}

/**
 * Spawn zone is a circle which doesn't intersect with anything.
 *
 * Map<zoneIndex, [circleCenterX, circleCenterY]>
 */
export type SpawnZones = Map<number, [number, number]>;

export interface PowerupSpawnChunk {
  /**
   * Amount of powerups in the chunk on the map.
   */
  spawned: number;

  /**
   * Last spawn time, ms.
   */
  last: number;

  /**
   * Currently not used.
   */
  attend: number;

  /**
   * Predefined spawn zones.
   */
  zones: SpawnZones;

  id: number;

  x: number;

  y: number;

  width: number;

  height: number;

  /**
   * Shield/inferno spawn chance ratio [0, 1]. 0 - only infernos, 1 - only shields.
   */
  chanceRatio: number;

  chanceFactor: number;
}

export type ConnectionId = number;

export type MainConnectionId = ConnectionId;

export type BackupConnectionId = ConnectionId;

export type SyncConnectionId = ConnectionId;

export type MobId = number;

export type PlayerId = MobId;

export type TeamId = number;

export type PlayerName = string;

export type ViewportId = PlayerId;

export type IPv4 = string;

export type UserId = string;

/**
 * Timestamp as generated by Date.now()
 */
export type Timestamp = number;

/**
 * Time in ms.
 */
export type UnmuteTime = number;

export interface PlayerRecoverItem {
  expired: number;
  ip: IPv4;
  data: any;
}

export interface PlayerNameHistoryItem {
  id: PlayerId;
  expired: number;
}

export interface Viewport {
  id: PlayerId;

  /**
   * This redundant value is necessary for optimization.
   * Do not use it to check the connection status,
   * it doesn't update after initialization.
   */
  connectionId: MainConnectionId;

  hitbox: Polygon;
  subs: Set<ViewportId>;
  current: Set<MobId>;
  leaved: Set<MobId>;
  horizonX: number;
  horizonY: number;
}

export type Viewports = Map<ViewportId, Viewport>;

export interface WorkerConnectionMeta {
  id: ConnectionId;
  ip: IPv4;
  createdAt: number;
  headers: { [title: string]: string };
}

export interface ConnectionMeta extends WorkerConnectionMeta {
  isBackup: boolean;
  isMain: boolean;
  isSync: boolean;
  status: CONNECTIONS_STATUS;

  isBot: boolean;
  playerId: PlayerId;
  teamId: TeamId;
  userId: UserId;

  /**
   * ms.
   */
  lastPacketAt: number;

  lagging: {
    isActive: boolean;
    /**
     * ms.
     */
    lastAt: number;
    /**
     * ms.
     */
    lastDuration: number;
    detects: number;
    packets: number;
  };

  periodic: {
    ping: NodeJS.Timeout;
  };

  timeouts: {
    login: NodeJS.Timeout;
    ack: NodeJS.Timeout;
    backup: NodeJS.Timeout;
    pong: NodeJS.Timeout;
    respawn: NodeJS.Timeout;
    lagging: NodeJS.Timeout;
  };

  pending: {
    login: boolean;
    respawn: boolean;
    spectate: boolean;
  };

  limits: {
    any: number;
    chat: number;
    key: number;
    respawn: number;
    spectate: number;
    su: number;
    debug: number;
    spam: number;
  };

  sync: {
    auth: {
      nonce: string;
      complete: boolean;
    };
    init: {
      complete: boolean;
    };
  };
}

export interface PlayerConnection extends WebSocket {
  meta?: WorkerConnectionMeta;
}

export interface PeriodicPowerupTemplate {
  /**
   * Respawn interval, seconds.
   */
  interval: number;

  /**
   * random(0, randomInterval) value added to a constant `interval`.
   * May be used to make frontend timers useless.
   *
   * Seconds.
   */
  randomInterval?: number;

  /**
   * Spawn position.
   */
  posX: number;
  posY: number;

  /**
   * Shield or inferno.
   */
  type: MOB_TYPES;
}

export interface PeriodicPowerup extends PeriodicPowerupTemplate {
  mobId: MobId;
  chunkId: number;

  /**
   * ms.
   */
  lastUpdate: number;

  /**
   * Periodic powerups are always permanent (not despawn).
   */
  permanent: boolean;
}

type AuthTokenJsonData = string;

type AuthTokenSignature = string;

export type AuthToken = [AuthTokenJsonData, AuthTokenSignature];

export type AuthTokenData = {
  uid: string;
  ts: number;
  for: string;
};

export interface MissileTemplate {
  type: MOB_TYPES;
  x: number;
  y: number;
  rot: number;
  alt: boolean;
}

export interface FireTemplate {
  [key: string]: MissileTemplate[];
}

export interface SpawnZone {
  MIN_X: number;
  MIN_Y: number;
  MAX_X: number;
  MAX_Y: number;
}

export interface SpawnZonesTemplate {
  [key: number]: SpawnZone[];
}

export type BroadcastStorage = Map<MobId, Set<MainConnectionId>>;

export interface UsersStorage {
  /**
   * User entities.
   */
  list: Map<UserId, User>;

  /**
   * Logged-in user ids, mapped to player ids.
   */
  online: Map<UserId, PlayerId>;

  /**
   * Is users data unsaved.
   */
  hasChanges: boolean;
}

export interface BountyRankingItem {
  id: PlayerId;
  score: number;
}

export interface RankingsStorage {
  outdated: boolean;
  byBounty: BountyRankingItem[];
}

export interface CTFLeadersStorage {
  /**
   * Blue leader ID.
   */
  blueId: PlayerId;

  /**
   * Blue leader info updated at.
   * ms timestamp.
   */
  blueUpdatedAt: number;

  /**
   * Is blue leader elections running right now.
   */
  isBlueElections: boolean;

  /**
   * Red leader ID.
   */
  redId: PlayerId;

  /**
   * Blue leader info updated at.
   * ms timestamp.
   */
  redUpdatedAt: number;

  /**
   * Is red leader elections running right now.
   */
  isRedElections: boolean;
}

export interface CTFStorage {
  flags: {
    blueId: MobId;
    redId: MobId;
  };

  leaders: CTFLeadersStorage;
}

export interface LoginServerConfig {
  /**
   * Server scale factor.
   */
  sf: number;

  /**
   * AFK disconnect timeout in minutes.
   */
  afk?: number;

  /**
   * Auto-prefix for the bots name.
   */
  botsNamePrefix: string;
}

export interface AdminPlayersListItem {
  id: PlayerId;
  name: PlayerName;
  captures: number;
  isSpectate: boolean;
  kills: number;
  deaths: number;
  score: number;
  lastMove: number;
  ping: number;
  flag: string;
  isMuted: boolean;
  isBot: boolean;
}

export interface AdminActionPlayer {
  id: PlayerId;
  name: PlayerName;
  ip: IPv4;
}

export type GameLoopCallbackLegacy = (
  /**
   * Frame index.
   */
  frame: number,

  /**
   * Frame index.
   */
  frameFactor: number,

  /**
   * Ns since previous not skipped tick.
   */
  nsFromTheTickerStart: number,

  /**
   * Number of skipped frames since previous tick.
   */
  skippedFrames: number
) => void;

export interface GameLoopCallback {
  /**
   * @param frame Frame index.
   * @param frameFactor Frame factor.
   * @param nsFromTheTickerStart Ns since previous not skipped tick.
   * @param skippedFrames Number of skipped frames since previous tick.
   */
  (frame: number, frameFactor: number, nsFromTheTickerStart: number, skippedFrames: number): void;
}

export interface GameServerBootstrapInterface {
  mainLoop: GameLoopCallback;
}

export interface SyncUpdateMetadata {
  /**
   * Time of last state change.
   */
  stateChangeTime: Timestamp;

  /**
   * Last result from submitting update to sync service.
   */
  lastAckResult: number;

  /**
   * Number of attempts to send update.
   */
  sendCount: number;
}

export interface SyncDataUpdate {
  /**
   * Metadata, for timeouts and resends.
   */
  meta: SyncUpdateMetadata;

  /**
   * Object type.
   */
  type: string;

  /**
   * Object identity.
   */
  id: string;

  /**
   * Object data (JSON).
   */
  data: string;

  /**
   * Time of update event.
   */
  timestamp: Timestamp;

  /**
   * Event data (JSON).
   */
  event: string;
}

export type SequenceId = number;

export interface SyncStorage {
  /**
   * Only active if we have a connection from sync service that has been initialized.
   */
  active: boolean;

  /**
   * Connection id from sync service, if connected and initialized.
   */
  connectionId: SyncConnectionId;

  /**
   * Next sequence id for object data update message.
   */
  nextSequenceId: SequenceId;

  /**
   * Server identity (region-room).
   */
  thisServerId: string;

  /**
   * Public websocket endpoint of this server.
   */
  thisServerEndpoint: string;

  /**
   * Updates waiting to be assigned a sequence id.
   *
   * Initial state after being enqueued if sync connection not active.
   */
  updatesAwaitingSequenceId: Array<SyncDataUpdate>;

  /**
   * Updates waiting to be sent to sync service.
   *
   * State after being assigned a sequence id. Initial state after being enqueued if sync connection active.
   */
  updatesAwaitingSend: Map<SequenceId, SyncDataUpdate>;

  /**
   * Updates waiting to be acknowledged by sync service.
   *
   * State after update has been sent.
   */
  updatesAwaitingAck: Map<SequenceId, SyncDataUpdate>;

  /**
   * Updates waiting to be resent to sync service.
   *
   * State after acknowledgement timed out or received a transient error.
   */
  updatesAwaitingResend: Map<SequenceId, SyncDataUpdate>;

  /**
   * Objects subscribed to.
   */
  subscribedObjects: Set<string>;
}

export * from './entities';
