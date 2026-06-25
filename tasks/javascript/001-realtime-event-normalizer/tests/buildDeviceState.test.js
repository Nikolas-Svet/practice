const { buildDeviceState } = require('../src');
const assert = require('node:assert/strict');

const events = [
  { deviceId: 'drone-2', type: 'connected', timestamp: '2026-06-18T10:00:00.000Z' },
  { deviceId: 'drone-1', type: 'connected', timestamp: '2026-06-18T10:01:00.000Z' },
  {
    deviceId: 'drone-1',
    type: 'position',
    timestamp: '2026-06-18T10:02:00.000Z',
    payload: { lat: 54.75, lng: 87.11 },
  },
  {
    deviceId: 'drone-1',
    type: 'position',
    timestamp: '2026-06-18T09:59:00.000Z',
    payload: { lat: 1, lng: 1 },
  },
  {
    deviceId: 'drone-1',
    type: 'battery',
    timestamp: '2026-06-18T10:03:00.000Z',
    payload: { value: 18 },
  },
  {
    deviceId: 'drone-1',
    type: 'battery',
    timestamp: '2026-06-18T10:04:00.000Z',
    payload: { value: 0 },
  },
  { deviceId: 'drone-1', type: 'disconnected', timestamp: '2026-06-18T10:05:00.000Z' },
  {
    deviceId: 'drone-2',
    type: 'battery',
    timestamp: '2026-06-18T10:01:00.000Z',
    payload: { value: 101 },
  },
  { deviceId: 'drone-2', type: 'disconnected', timestamp: '2026-06-18T10:06:00.000Z' },
  {
    deviceId: 'drone-0',
    type: 'position',
    timestamp: '2026-06-18T10:07:00.000Z',
    payload: { lat: 0, lng: 0 },
  },
  { deviceId: 'drone-0', type: 'position', timestamp: '2026-06-18T10:08:00.000Z' },
  { deviceId: 'drone-3', type: 'unknown', timestamp: '2026-06-18T10:05:00.000Z' },
  { type: 'connected', timestamp: '2026-06-18T10:05:00.000Z' },
];

const expected = [
  {
    deviceId: 'drone-0',
    online: false,
    lastSeen: '2026-06-18T10:07:00.000Z',
    position: { lat: 0, lng: 0 },
    battery: null,
    warnings: [],
  },
  {
    deviceId: 'drone-1',
    online: false,
    lastSeen: '2026-06-18T10:05:00.000Z',
    position: { lat: 54.75, lng: 87.11 },
    battery: 0,
    warnings: ['low-battery'],
  },
  {
    deviceId: 'drone-2',
    online: false,
    lastSeen: '2026-06-18T10:06:00.000Z',
    position: null,
    battery: null,
    warnings: [],
  },
];

assert.deepStrictEqual(buildDeviceState(events), expected);
assert.deepStrictEqual(buildDeviceState([]), []);

console.log('All buildDeviceState checks passed');
