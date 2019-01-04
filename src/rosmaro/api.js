import consolidateModels from './../modelConsolidator/api';
import expandGraph from './../graphBuilder/api';
import fsm from './../fsm/api';
import {nonEmptyArrow, removeUnusedFSMState} from './../utils/all';
import dispatch from './../dispatcher/api';
import extendFSMState from './FSMState';

// {graph, bindings}
export default (modelDescription) => {
  const consolidatedModel = consolidateModels(modelDescription);

  return ({state, action}) => {
    const context = state ? state.context : undefined;

    // {graph, handlers, lenses}
    const modelParts = expandGraph({
      context: context,
      plan: consolidatedModel
    });

    // FSMState
    const FSMState = extendFSMState({
      state,
      graph: modelParts.graph
    });

    // {arrows, context, result}
    const dispatchRes = dispatch({
      graph: modelParts.graph,
      FSMState: FSMState,
      handlers: modelParts.handlers,
      context: context,
      action,
      lenses: modelParts.lenses,
    });

    // newFSMState
    const newFSMState = fsm({
      graph: modelParts.graph, 
      FSMState: FSMState, 
      arrows: dispatchRes.arrows
    });

    // newModelParts (so we know the new graph)
    const newModelParts = expandGraph({
      context: dispatchRes.context,
      plan: consolidatedModel
    });

    const anyArrowFollowed = dispatchRes.arrows.some(nonEmptyArrow);

    return {
      state: {
        FSMState: removeUnusedFSMState({
          newFSMState, 
          graph: newModelParts.graph
        }),
        context: dispatchRes.context,
      },
      anyArrowFollowed,
      result: dispatchRes.result
    };

  };

};