import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_MAP_STATE, mapReducer, canFinishEntry, regionPhase } from './mapMachine.ts';
import { MAP_REGIONS, findRegionAtPoint } from './regions.ts';

const focus = (id = 'nordeste', state = INITIAL_MAP_STATE) =>
  mapReducer(state, { type: 'press', regionId: id });
const select = (state = focus()) =>
  mapReducer(state, { type: 'focusFinished', revision: state.revision });

test('first activation focuses, completion selects, second activation enters', () => {
  const focused = focus();
  assert.equal(focused.phase, 'focused');
  const selected = select(focused);
  assert.equal(selected.phase, 'selected');
  assert.equal(regionPhase(selected, 'norte'), 'idle');
  assert.equal(regionPhase(selected, 'nordeste'), 'selected');
  const entering = mapReducer(selected, { type: 'press', regionId: 'nordeste' });
  assert.equal(entering.phase, 'entering');
  assert.ok(canFinishEntry(entering, entering.revision));
});

test('CTA and second activation produce the same entry state', () => {
  const selected = select();
  assert.deepEqual(
    mapReducer(selected, { type: 'confirm' }),
    mapReducer(selected, { type: 'press', regionId: 'nordeste' })
  );
});

test('rapid same-region activations and CTA during focus cannot enter', () => {
  const state = focus();
  assert.equal(mapReducer(state, { type: 'press', regionId: 'nordeste' }), state);
  assert.equal(mapReducer(state, { type: 'confirm' }), state);
  assert.equal(mapReducer(INITIAL_MAP_STATE, { type: 'confirm' }), INITIAL_MAP_STATE);
});

test('switching region invalidates the previous animation, even when returning to it', () => {
  const first = focus();
  const second = focus('norte', first);
  const third = focus('nordeste', second);
  assert.equal(mapReducer(second, { type: 'focusFinished', revision: first.revision }), second);
  assert.equal(mapReducer(third, { type: 'focusFinished', revision: first.revision }), third);
  assert.equal(select(third).regionId, 'nordeste');
});

test('paper/back cancellation clears selection and invalidates callbacks', () => {
  for (const state of [focus(), select()]) {
    const cancelled = mapReducer(state, { type: 'cancel' });
    assert.equal(cancelled.phase, 'idle');
    assert.equal(cancelled.regionId, null);
    assert.equal(
      mapReducer(cancelled, { type: 'focusFinished', revision: state.revision }),
      cancelled
    );
  }
});

test('entry blocks duplicate confirmation, other regions and cancellation', () => {
  const entering = mapReducer(select(), { type: 'confirm' });
  for (const event of [
    { type: 'confirm' },
    { type: 'press', regionId: 'sul' },
    { type: 'cancel' },
  ]) {
    assert.equal(mapReducer(entering, event), entering);
  }
  assert.equal(canFinishEntry(entering, entering.revision - 1), false);
  assert.equal(
    canFinishEntry({ ...entering, revision: entering.revision + 1 }, entering.revision),
    false
  );
});

test('leaving/backgrounding resets every phase and invalidates queued entry', () => {
  const entering = mapReducer(select(), { type: 'confirm' });
  for (const state of [INITIAL_MAP_STATE, focus(), select(), entering]) {
    const reset = mapReducer(state, { type: 'reset' });
    assert.equal(reset.phase, 'idle');
    assert.equal(reset.regionId, null);
    assert.equal(canFinishEntry(reset, entering.revision), false);
    assert.ok(reset.revision > state.revision);
  }
});

test('immediate reduced-motion completion still requires a second activation', () => {
  const selected = select(focus());
  assert.equal(canFinishEntry(selected, selected.revision), false);
  const entering = mapReducer(selected, { type: 'confirm' });
  assert.ok(canFinishEntry(entering, entering.revision));
});

test('native touch resolver maps every regional anchor and ignores paper', () => {
  for (const region of MAP_REGIONS) {
    assert.equal(findRegionAtPoint(region.anchor)?.id, region.id);
  }
  assert.equal(findRegionAtPoint([0, 0]), undefined);
  assert.equal(findRegionAtPoint([300, 300]), undefined);
});
