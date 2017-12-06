import assert from 'assert';
import build from './../src/graphBuilder';

describe('graph builder', () => {
  it('turns a graph plan into a graph', () => {

    const graphPlan = {

      'main': {
        type: 'graph',
        nodes: {
          A: 'A', 
          B: 'B'
        },
        arrows: {
          A: {
            x: {target: 'B', entryPoint: 'p'}
          }
        },
        entryPoints: {
          start: {target: 'A', entryPoint: 'start'}
        }
      },

      'A': {
        type: 'leaf'
      },

      'B': {
        type: 'composite',
        nodes: {
          'A': 'BSub',
          'B': 'BSub'
        }
      },

      'BSub': {
        type: 'graph',
        nodes: {
          A: 'BSubA',
          B: 'BSubB'
        },
        arrows: {
          A: {
            x: {target: 'B', entryPoint: 'start'}
          }
        },
        entryPoints: {
          start: {target: 'A', entryPoint: 'start'},
          p: {target: 'B', entryPoint: 'start'}
        }
      },

      'BSubA': {type: 'leaf'},
      'BSubB': {type: 'leaf'}

    };

    const expectedGraph = {

      'main': {
        type: 'graph',
        nodes: ['main:A', 'main:B'],
        parent: null,
        arrows: {
          'main:A': {
            x: {target: 'main:B', entryPoint: 'p'}
          },
          'main:B': {}
        },
        entryPoints: {
          start: {target: 'main:A', entryPoint: 'start'}
        }
      },

      'main:A': {
        type: 'leaf',
        parent: 'main'
      },

      'main:B': {
        type: 'composite',
        nodes: ['main:B:A', 'main:B:B'],
        parent: 'main'
      },

      'main:B:A': {
        type: 'graph',
        nodes: ['main:B:A:A', 'main:B:A:B'],
        parent: 'main:B',
        arrows: {
          'main:B:A:A': {
            x: {target: 'main:B:A:B', entryPoint: 'start'}
          },
          'main:B:A:B': {}
        },
        entryPoints: {
          start: {target: 'main:B:A:A', entryPoint: 'start'},
          p: {target: 'main:B:A:B', entryPoint: 'start'}
        }
      },

      'main:B:B': {
        type: 'graph',
        nodes: ['main:B:B:A', 'main:B:B:B'],
        parent: 'main:B',
        arrows: {
          'main:B:B:A': {
            x: {target: 'main:B:B:B', entryPoint: 'start'}
          },
          'main:B:B:B': {}
        },
        entryPoints: {
          start: {target: 'main:B:B:A', entryPoint: 'start'},
          p: {target: 'main:B:B:B', entryPoint: 'start'}
        },
      },

      'main:B:B:A': {type: 'leaf', parent: 'main:B:B'},
      'main:B:B:B': {type: 'leaf', parent: 'main:B:B'},
      'main:B:A:A': {type: 'leaf', parent: 'main:B:A'},
      'main:B:A:B': {type: 'leaf', parent: 'main:B:A'}

    };

    const builtGraph = build(graphPlan);
    assert.deepEqual(builtGraph, expectedGraph);

  });
});
