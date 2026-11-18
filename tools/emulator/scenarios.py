"""Maintained scenarios adapted from the project's successful emulator replays."""
import json
from pathlib import Path
import time

NODES = json.loads((Path(__file__).parent / 'targets.json').read_text())


def require(condition, message):
    if not condition:
        raise RuntimeError(message)


def prepare(c):
    # Reload once into the normal menu; never modify or clear localStorage.
    c.run('browser', 'reload', {})
    end = time.monotonic() + 35
    while time.monotonic() < end:
        snapshot = c.run('browser', 'snapshot')
        names = [e.get('name', '') for e in snapshot.get('elements', []) if e.get('role') == 'button']
        if any(n in ['Play', 'Continue', 'Visit your garden'] or n.startswith('Next:') for n in names):
            break
        time.sleep(.5)
    else:
        raise RuntimeError('The normal game menu did not appear after reload; inspect the runtime.')
    if not c.run('xr', 'status')['sessionActive']:
        c.run('xr', 'enter')
    c.run('xr', 'set-transform', {'device': 'headset', 'position': {'x': 0, 'y': 1.6, 'z': 0},
                                'orientation': {'x': 0, 'y': 0, 'z': 0, 'w': 1}})
    c.press('settings')
    entity = c.run('ecs', 'find', {'namePattern': 'spatial-settings'})['entities'][0]
    def on(selector):
        text = c.run('ui', 'inspect', {'entityIndex': entity['entityIndex'], 'selector': selector})['elements'][0]['text']
        return text.lower().endswith(': on')
    if not on('#assist-label'):
        c.press('assist-toggle')
    if not on('#reach-label'):
        c.press('reach-toggle')
    c.press('place-world')
    c.press('settings-back')
    c.run('xr', 'set-connected', {'device': 'hand-left', 'connected': False})
    c.run('xr', 'set-connected', {'device': 'hand-right', 'connected': True})
    c.press('play')
    c.report('replay-start-checkpoint')
    c.press('menu')


def select(c, chapter, encounter, from_game=False):
    require(c.metrics()['completed'] >= chapter * 3 + encounter,
            'This encounter is locked. Earn its preceding milestones with the chapters suite; no unlocks were changed.')
    if from_game:
        c.press('menu')
    for target in ['restart', 'journey-' + str(chapter), 'journey-' + str(encounter)]:
        c.press(target)


def touch(c, chapter, encounter, name, seconds=1):
    node = next(n for n in NODES[chapter][encounter - 1] if n['id'] == name)
    c.point(node['x'], node['y'], node['z'], seconds)


def gesture(c, chapter):
    if chapter == 0:
        c.point(-.23, 1.02, -.62)
        c.point(.23, 1.02, -.62)
    elif chapter == 1:
        c.point(0, 1.02, -.54)
        c.point(0, 1.22, -.54)
    elif chapter == 2:
        c.circle()
        c.point(-.23, 1.10, -.58)
    else:
        c.point(0, 1.27, -.54)
        c.point(0, 1.05, -.54)


def until(c, chapter, predicate, timeout=45):
    end = time.monotonic() + timeout
    while time.monotonic() < end:
        m = c.metrics()
        if predicate(m):
            return m
        if chapter == 2:
            c.point(-.28 + .67 * m['progress'], 1.10, -.58, .05)
        time.sleep(.15)
    c.report('timeout')
    raise RuntimeError('Encounter did not reach its expected state.')


def encounter(c, ch, en):
    gesture(c, ch)
    if en:
        until(c, ch, lambda m: m['progress'] >= m['puzzleStop'] - .001 and not m['challengeDone'])
        if ch == 0 and en == 1:
            c.point(0, 1.30, -.4, 1)
            touch(c, ch, en, 'seed')
        elif ch == 0:
            touch(c, ch, en, 'fork')
            time.sleep(.2)
            require(c.metrics()['puzzleInvitations'] == 2, 'Both Leaf path choices should remain visible.')
            for name in ['sheltered', 'perch', 'lantern']:
                touch(c, ch, en, name)
        elif ch == 1 and en == 1:
            c.point(0, 1.19, -.52, 2.5)
            c.point(0, 1.04, -.52, 1.1)
        elif ch == 1:
            for name, seconds in [('water-rest', 1), ('redirect', 1), ('lily-0', 2), ('restore', 1.1)]:
                touch(c, ch, en, name, seconds)
        elif ch == 2 and en == 1:
            c.point(.04, .99, -.58, 1)
            touch(c, ch, en, 'next-shelter', 1.6)
        elif ch == 2:
            for name, seconds in [('receive', 1), ('lamp-0', 1.8), ('lamp-2', 1.8)]:
                touch(c, ch, en, name, seconds)
        elif en == 1:
            touch(c, ch, en, 'balance-left')
            until(c, ch, lambda m: m['progress'] >= m['puzzleStop'] - .001 and not m['challengeDone'])
            touch(c, ch, en, 'balance-right')
        else:
            for name in ['piece-1', 'slot-1', 'piece-0', 'slot-0', 'widen-left', 'widen-right']:
                touch(c, ch, en, name)
        require(c.metrics()['challengeDone'], 'The encounter puzzle has not completed.')
    until(c, ch, lambda m: m['progress'] >= 1 and m['endingTime'] >= 5.3)
    m = c.report('home-' + str(ch) + '-' + str(en))
    require(m['chapterRestored'] == en + 1, 'The chapter restoration did not match its completed encounter.')
    require(0 < m['welcomeLight'] < .012, 'The tabletop welcome light exceeded its cap.')
    if ch == 0 and en:
        require(not m['giftOffered'], 'The First Light gift repeated in a later encounter.')


def leaf(c):
    select(c, 0, 0)
    for en in range(3):
        encounter(c, 0, en)
        if en < 2:
            c.press('next-chapter')
    c.photo('leaf-home')


def chapters(c):
    select(c, 0, 0)
    for ordinal in range(12):
        ch, en = divmod(ordinal, 3)
        encounter(c, ch, en)
        if en == 2:
            c.photo('chapter-' + str(ch))
        if ordinal < 11:
            c.press('next-chapter')
    require(c.metrics()['completed'] == 12, 'The full journey must retain twelve milestones.')


def channel(c, side):
    x = -.18 if side == 1 else .18
    c.point(x, 1.28, -.34, .3)
    c.point(x, 1.06, -.34, .7)


def finale(c):
    select(c, 3, 2)
    encounter(c, 3, 2)
    channel(c, 1)
    c.point(0, 1.02, -.8)
    c.point(0, 1.22, -.8, 1.8)
    c.point(-.23, 1.13, -.62, .7)
    c.point(.23, 1.13, -.62, .7)
    c.point(-.18, 1.06, -.34)
    c.point(-.18, 1.28, -.34, .9)
    require(c.metrics()['lastLightAqueduct'], 'The raised water route did not latch.')
    c.circle()
    c.point(.16, 1.13, -.52, 1)
    require(c.metrics()['lastLightStage'] == 4, 'The raised route did not protect the hearth.')
    channel(c, 1)
    channel(c, 2)
    require(c.metrics()['lastLightStage'] == 4, 'The ground diversion must also solve the same puzzle.')
    c.run('xr', 'set-connected', {'device': 'hand-right', 'connected': False})
    time.sleep(1.2)
    require(c.metrics()['lastLightStage'] == 4, 'Tracking loss must never trigger handoff.')
    c.run('xr', 'set-connected', {'device': 'hand-right', 'connected': True})
    c.point(.6, 1.25, -.4, 1.4)
    c.wait(lambda m: m['finaleTime'] >= 24)
    c.report('finale-home')
    c.photo('finale-home')


def memory(c):
    require(c.metrics()['completed'] == 12, 'The optional request requires an earned completed journey.')
    c.press('play')
    m = c.metrics()
    require(m['lastLightStage'] == 5 and m['finaleTime'] >= 24,
            'Finish The Last Light first; the harness will not fabricate this checkpoint.')
    if m['memoryGrowth'] < 8:
        c.point(.25, 1.02, -.70, .7)
        c.point(.25, 1.22, -.70, .8)
        c.point(.40, 1.26, -.48, .7)
        c.point(.40, 1.04, -.48, .7)
        c.circle(.25, 1.13, -.70, .12)
    c.wait(lambda m: m['memoryGrowth'] == 8 and m['memoryLesson'] == 18, 35)
    c.report('flower-and-lesson')
    c.photo('flower-and-lesson')


def audio(c):
    entity = c.run('ecs', 'find', {'namePattern': 'spatial-menu'})['entities'][0]
    def enabled():
        return 'on' in c.run('ui', 'inspect', {'entityIndex': entity['entityIndex'], 'selector': '#sound-label'})['elements'][0]['text'].lower()
    original = enabled()
    in_game = False
    try:
        if not original:
            c.press('sound-toggle')
        c.press('play')
        in_game = True
        time.sleep(2)
        require(c.metrics()['audioRms'] > 0, 'Enabled game audio produced no signal.')
        c.press('menu')
        in_game = False
        c.press('sound-toggle')
        c.press('play')
        in_game = True
        time.sleep(1.5)
        require(c.metrics()['audioPeak'] < .0001, 'Sound off did not mute the full game mix.')
    finally:
        if in_game:
            c.press('menu')
        if enabled() != original:
            c.press('sound-toggle')
    c.report('audio-mute-restored')


def residents(c):
    expected = ['LeafPod', 'RiverDrop', 'BraveFlame', 'MossStone']
    require(c.metrics()['completed'] >= 9, 'Earn the four chapter arrivals before comparing their residents.')
    for chapter, model in enumerate(expected):
        select(c, chapter, 0, from_game=chapter > 0)
        time.sleep(.3)
        m = c.report('home-resident-' + str(chapter))
        require(m['homeResidentElement'] == chapter and m['homeResidentModel'] == model,
                'The hut resident did not switch to ' + model)
        c.photo('resident-' + str(chapter))


def habitat(c):
    """Normal hand input proves optional scenery feedback without solving a puzzle."""
    entity = c.run('ecs', 'find', {'namePattern': 'spatial-menu'})['entities'][0]
    def sound_enabled():
        return 'on' in c.run('ui', 'inspect', {'entityIndex': entity['entityIndex'], 'selector': '#sound-label'})['elements'][0]['text'].lower()
    original = sound_enabled()
    completed = c.metrics()['completed']
    require(completed == 12, 'This revisit check requires earned chapter milestones.')
    if not original:
        c.press('sound-toggle')
    for chapter in range(4):
        select(c, chapter, 0, from_game=chapter > 0)
        c.point(0, 1.5, -.3, .7)
        before = c.metrics()
        c.point(-.605, 1.05, -.465, .65)
        m = c.report('habitat-brush-' + str(chapter))
        require(m['habitatResponse'] > .4, 'Nearby planting did not respond to the hand.')
        require(m['habitatRustles'] > before['habitatRustles'], 'The brush did not produce spatial audio.')
        require(m['progress'] == 0 and not m['woven'], 'Optional scenery must not advance the puzzle.')
        require(m['habitatRestored'] == 3 and m['habitatPathLight'] > .95, 'Earned gardens or path lamps disappeared on replay.')
        c.run('xr', 'set-connected', {'device': 'hand-right', 'connected': False})
        time.sleep(.7)
        require(c.metrics()['habitatResponse'] < .05, 'Scenery must relax after hand tracking loss.')
        c.run('xr', 'set-connected', {'device': 'hand-right', 'connected': True})
        c.point(0, 1.5, -.3, .4)
        c.photo('habitat-' + str(chapter))
    c.press('menu')
    if sound_enabled() != original:
        c.press('sound-toggle')
    prepare(c)
    m = c.report('habitat-after-reload')
    require(m['completed'] == completed and m['habitatRestored'] == 3, 'Ecological progress did not survive reload.')


def menus(c):
    """Check navigation and reversible settings through the selected input path."""
    def label(panel, selector):
        entity = c.run('ecs', 'find', {'namePattern': panel})['entities'][0]
        return c.run('ui', 'inspect', {'entityIndex': entity['entityIndex'], 'selector': selector})['elements'][0]['text']
    def target_visible(name):
        return any(t['name'] == name for t in c.run('xr', 'list-targets')['targets'])
    sound = label('spatial-menu', '#sound-label')
    c.press('sound-toggle')
    require(label('spatial-menu', '#sound-label') != sound, 'Sound toggle did not change.')
    c.press('sound-toggle')
    require(label('spatial-menu', '#sound-label') == sound, 'Sound preference was not restored.')
    c.press('settings')
    require(target_visible('settings-back'), 'Settings did not open.')
    for control, selector in [('reach-toggle', '#reach-label'), ('assist-toggle', '#assist-label'), ('guidance-toggle', '#guidance-label')]:
        before = label('spatial-settings', selector)
        c.press(control)
        require(label('spatial-settings', selector) != before, control + ' did not change.')
        c.press(control)
        require(label('spatial-settings', selector) == before, control + ' was not restored.')
    height = c.metrics()['bridgeHeight']
    c.press('raise-world')
    require(c.metrics()['bridgeHeight'] > height + .04, 'Raise did not move the world.')
    c.press('lower-world')
    require(abs(c.metrics()['bridgeHeight'] - height) < .001, 'Lower did not restore the height.')
    c.press('place-world')
    c.press('settings-back')
    c.press('restart')
    require(target_visible('journey-back'), 'Journey picker did not open.')
    c.press('journey-0')
    c.press('journey-back')
    c.press('journey-back')
    require(target_visible('play'), 'Journey back did not return to the main menu.')
    c.press('play')
    require(target_visible('menu'), 'Play did not enter the game.')
    c.press('menu')
    require(target_visible('settings'), 'Pause did not return to the main menu.')
    c.report('menus-and-settings-passed')
    c.photo('hand-menu')
    c.press('exit')
    require(not c.run('xr', 'status')['sessionActive'], 'Exit did not leave the immersive session.')

def invitations(c):
    """Offer, withdraw and return in the opening encounter of each element."""
    for ch in range(4):
        select(c, ch, 0, from_game=ch > 0)
        if ch == 0:
            c.point(-.25, 1.04, -.58, .1)
        elif ch == 1:
            c.point(0, 1.02, -.54)
        elif ch == 2:
            c.point(.16, 1.13, -.52)
        else:
            c.point(0, 1.27, -.54)
        c.run('xr', 'set-connected', {'device': 'hand-right', 'connected': False})
        time.sleep(.85)
        require(c.metrics()['progress'] == 0, 'Tracking loss advanced a crossing.')
        c.run('xr', 'set-connected', {'device': 'hand-right', 'connected': True})
        if ch == 0:
            c.point(-.25, 1.04, -.58, 3.5)
            require(c.metrics()['handMeeting'] == 5, 'Leaf did not trust the returning hand.')
        encounter(c, ch, 0)
        c.report('returned-hand-' + str(ch))
        c.photo('homecoming-' + str(ch))
