import Tracking from './tracking';
figma.showUI(__html__, {width: 300, height: 400});
const STICKY_DATA_ENDPOINT = 'sticky_data';
const USER_DATA_ENDPOINT = 'user_data';
// init: Setting tracking info / fetch storage
figma.clientStorage.getAsync(USER_DATA_ENDPOINT).then((data) => {
  if (!data || !data?.UUID) {
    const _data = {
      UUID: Tracking.createUUID(),
    };
    figma.clientStorage.setAsync(USER_DATA_ENDPOINT, _data);
    figma.ui.postMessage({
      type: 'track-init-without-data',
      message: _data,
    });
    return;
  } else {
    figma.ui.postMessage({
      type: 'track-init-with-data',
      message: data,
    });
    return;
  }
});

/**
 *  TODO: making a group of sticky = Polls is hard,
 * for now, focus on simple sticky counter.
 * */

// interface PollType {
//   id: string;
//   title?: string;
//   options?: OptionType[];
// }
// interface OptionType {
//   id: string;
//   title?: string;
// }

// figma.loadFontAsync({family: 'Roboto', style: 'Regular'});
// figma.loadFontAsync({family: 'Inter', style: 'Medium'});
// figma.clientStorage.getAsync(USER_DATA_ENDPOINT).then((data) => {
//   if (!data) {
//     figma.clientStorage.setAsync(USER_DATA_ENDPOINT, []);
//     return;
//   }
// });

// figma.ui.onmessage = async (msg) => {
//   if (msg.type === 'create-counter') {
//     const {pollTitle, options} = msg.data;
//     if (options.length < 1) return;

//     let optionsData: OptionType[] = [];
//     const container = figma.createFrame();
//     container.layoutMode = 'HORIZONTAL';
//     container.itemSpacing = 16;
//     container.fills = [];
//     container.primaryAxisAlignItems = 'SPACE_BETWEEN';
//     container.counterAxisSizingMode = 'AUTO';
//     container.name = 'container';

//     options.forEach((option) => {
//       const shape = figma.createShapeWithText();
//       shape.shapeType = 'ROUNDED_RECTANGLE';
//       shape.name = option?.title || '';
//       shape.text.characters = shape.name;
//       shape.text.fontSize = 24;
//       container.appendChild(shape);
//       shape.resize(400, 400);
//       optionsData = [
//         ...optionsData,
//         {
//           id: shape.id,
//           title: option?.title || '',
//         },
//       ];
//     });

//     const pollTitleElm = figma.createText();
//     pollTitleElm.characters = pollTitle || '';
//     pollTitleElm.fontSize = 36;
//     pollTitleElm.resize(pollTitleElm.width, pollTitleElm.fontSize * 1.25);
//     pollTitleElm.name = 'title';

//     const containerWrapper = figma.createFrame();
//     containerWrapper.layoutMode = 'VERTICAL';
//     containerWrapper.itemSpacing = 4;
//     containerWrapper.appendChild(pollTitleElm);
//     containerWrapper.appendChild(container);
//     containerWrapper.paddingLeft = 4;
//     containerWrapper.paddingRight = 4;
//     containerWrapper.paddingTop = 4;
//     containerWrapper.paddingTop = 4;
//     containerWrapper.fills = [];
//     containerWrapper.primaryAxisSizingMode = 'AUTO';
//     containerWrapper.counterAxisSizingMode = 'AUTO';

//     // store in clientStorage
//     figma.clientStorage.getAsync(USER_DATA_ENDPOINT).then((data: PollType[]) => {
//       const _data: PollType[] = [...data, {id: containerWrapper.id, title: pollTitle, options: optionsData}];
//       figma.clientStorage.setAsync(USER_DATA_ENDPOINT, _data);
//       figma.ui.postMessage({
//         type: 'sync-polls',
//         message: _data,
//       });
//     });
//   } else if (msg.type === 'remove-counters') {
//     figma.clientStorage.getAsync(USER_DATA_ENDPOINT).then(async (data: PollType[]) => {
//       data?.forEach((datum: PollType) => {
//         const element = figma.currentPage.findChild((e) => e.id === datum.id);
//         if (element) {
//           element.remove();
//         }
//       });
//       figma.clientStorage.setAsync(USER_DATA_ENDPOINT, []);
//       figma.ui.postMessage({
//         type: 'sync-polls',
//         message: [],
//       });
//     });
//   } else if (msg.type === 'find-counter') {
//     figma.clientStorage.getAsync(USER_DATA_ENDPOINT).then(async (data) => {
//       if (!data) return;
//       let winnerIndex = -1;
//       const countList = data?.map((itemID: string) => {
//         const element: GroupNode = figma.currentPage.findChild((e) => e.id === itemID) as GroupNode;
//         if (element) {
//           const text = element.findChild((e) => e.name.includes('text')) as TextNode;
//           const count = parseInt(text.name.slice(4), 10);
//           return count || 0;
//         }
//         return 0;
//       });
//       winnerIndex = indexOflargest(countList);
//       if (winnerIndex !== -1) {
//         const toNode = [figma.currentPage.findChild((c) => c.id === data[winnerIndex])];
//         figma.currentPage.selection = toNode;
//         figma.viewport.scrollAndZoomIntoView(toNode);
//       }
//     });
//   } else if (msg.type === 'fetch-polls') {
//     figma.clientStorage.getAsync(USER_DATA_ENDPOINT).then((data: PollType[]) => {
//       figma.ui.postMessage({
//         type: 'sync-polls',
//         message: data,
//       });
//     });
//   } else if (msg.type === 'select-counter') {
//     const element = figma.currentPage.findChild((e) => e.id === msg.id);
//     if (element) {
//       figma.currentPage.selection = [element];
//       figma.viewport.scrollAndZoomIntoView([element]);
//     }
//   }
// };

// figma.on('selectionchange', () => {
//   const stickys = figma.currentPage.selection.filter((n) => n.type === 'STICKY');
//   figma.ui.postMessage({
//     type: 'set-selectedSticky',
//     message: stickys,
//   });
// });
// setInterval(() => {
//   return;
//   const allStampElements = figma.currentPage.findAll((e) => e.type === 'STAMP');
//   const allStampPos = allStampElements.map((element) => getElementPos(element));
//   // check allStampPos if inside the counter:
//   if (allStampPos) {
//     figma.clientStorage.getAsync(USER_DATA_ENDPOINT).then(async (data: PollType[]) => {
//       data?.forEach((datum: PollType) => {
//         const poll: FrameNode = figma.currentPage.findChild((e) => e.id === datum.id) as FrameNode;
//         // get Frame, find the sticky inside the group
//         if (poll) {
//           const options = poll.findChild((e) => e.name === 'container') as FrameNode;
//           options?.children.map((option: ShapeWithTextNode) => {
//             const areaPos = getElementPos(option);
//             const count = calcElementInArea(areaPos, allStampPos);
//             console.log(`calc...${option.name} | 🗳 ${count}`);
//             option.text.characters = `${option.name} | 🗳 ${count}`;
//           });
//         }
//       });
//     });
//   }
// }, 1000);

const getElementPos = (element) => {
  return {
    x0: element.absoluteTransform[0][2],
    x1: element.absoluteTransform[0][2] + element.width,
    y0: element.absoluteTransform[1][2],
    y1: element.absoluteTransform[1][2] + element.height,
  };
};

const calcElementInArea = (area, stamps) => {
  let result = 0;
  stamps.forEach((stamp) => {
    if (stamp.x1 > area.x0 && stamp.x0 < area.x1 && stamp.y1 > area.y0 && stamp.y0 < area.y1) {
      result += 1;
    }
  });
  return result;
};

function indexOflargest(a) {
  return a.indexOf(Math.max.apply(Math, a));
}

interface StickyType {
  id: string;
  title?: string;
  count: number;
}

figma.loadFontAsync({family: 'Roboto', style: 'Regular'});
figma.loadFontAsync({family: 'Inter', style: 'Medium'});
figma.clientStorage.getAsync(STICKY_DATA_ENDPOINT).then((data: StickyType[]) => {
  if (!data) {
    figma.clientStorage.setAsync(STICKY_DATA_ENDPOINT, []);
    return;
  }
});

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'create-counter') {
    let data: StickyType[] = await figma.clientStorage.getAsync(STICKY_DATA_ENDPOINT);
    const stickys: StickyNode[] = figma.currentPage.selection.filter(
      (n) => n.type === 'STICKY' && data.findIndex((datum) => datum.id === n.id) === -1
    ) as StickyNode[];
    if (data) {
      data = [...data, ...stickys.map((sticky) => ({id: sticky.id, title: sticky.text.characters, count: 0}))];
      await figma.clientStorage.setAsync(STICKY_DATA_ENDPOINT, data);
      figma.ui.postMessage({
        type: 'sync-counters',
        message: data,
      });
    }
  } else if (msg.type === 'remove-counters') {
    let shouldRemoveList: string[] = msg.ids;
    let data: StickyType[] = await figma.clientStorage.getAsync(STICKY_DATA_ENDPOINT);
    data = data.filter((datum) => shouldRemoveList.findIndex((removeID) => removeID === datum.id) === -1);

    await figma.clientStorage.setAsync(STICKY_DATA_ENDPOINT, data);
    figma.ui.postMessage({
      type: 'sync-counters',
      message: data,
    });
  } else if (msg.type === 'select-counter') {
    focusElement(msg.id);
  } else if (msg.type === 'fetch-counters') {
    const data: StickyType[] = await figma.clientStorage.getAsync(STICKY_DATA_ENDPOINT);
    if (data) {
      figma.ui.postMessage({
        type: 'sync-counters',
        message: data,
      });
    }
  }
};
figma.on('selectionchange', async () => {
  let data: StickyType[] = await figma.clientStorage.getAsync(STICKY_DATA_ENDPOINT);
  const stickys = figma.currentPage.selection.filter(
    (n) => n.type === 'STICKY' && data.findIndex((datum) => datum.id === n.id) === -1
  );

  figma.ui.postMessage({
    type: 'set-selectedSticky',
    message: stickys,
  });
});

setInterval(async () => {
  countEachSticky();
}, 1000 / 1);

const focusElement = (id: string) => {
  const element = figma.currentPage.findChild((e) => e.id === id);
  if (element) {
    figma.currentPage.selection = [element];
    figma.viewport.scrollAndZoomIntoView([element]);
  }
};

const countEachSticky = async () => {
  const allStampElements = figma.currentPage.findAll(
    (e) => e.type === 'STAMP' || e.type === 'COMPONENT' || e.type === 'INSTANCE'
  );
  const allStampPos = allStampElements.map((element) => getElementPos(element));
  if (allStampPos) {
    let data: StickyType[] = await figma.clientStorage.getAsync(STICKY_DATA_ENDPOINT);
    if (data) {
      data = data?.map((datum: StickyType) => {
        const sticky: StickyNode = figma.currentPage.findChild((e) => e.id === datum.id) as StickyNode;
        if (sticky) {
          const areaPos = getElementPos(sticky);
          const count = calcElementInArea(areaPos, allStampPos);
          // console.log(`calc: ${sticky.name} | 🗳 ${count}`);
          datum.count = count;
          datum.title = sticky.text.characters;
        }
        return datum;
      });
      await figma.clientStorage.setAsync(STICKY_DATA_ENDPOINT, data);

      figma.ui.postMessage({
        type: 'sync-counters',
        message: data,
      });
    }
  }
};
