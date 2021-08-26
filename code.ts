figma.showUI(__html__, { width: 300, height: 200 });
const PREV_TEXT = `🗳 vote(s): `;
const USER_DATA_ENDPOINT = "user_data";

interface PollType {
  id: string;
  title?: string;
  options: OptionType[];
}
interface OptionType {
  id: string;
  title?: string;
}

figma.loadFontAsync({ family: "Inter", style: "Medium" });
figma.clientStorage.getAsync(USER_DATA_ENDPOINT).then((data) => {
  if (!data) {
    figma.clientStorage.setAsync(USER_DATA_ENDPOINT, []);
    return;
  }
});

figma.ui.onmessage = async (msg) => {
  if (msg.type === "create-counter") {
    const shape = figma.createShapeWithText();
    shape.shapeType = "ROUNDED_RECTANGLE";
    shape.name = "option1";
    shape.text.characters = shape.name;
    shape.text.fontSize = 24;

    const shape2 = figma.createShapeWithText();
    shape2.shapeType = "ROUNDED_RECTANGLE";
    shape2.name = "option2";
    shape2.text.characters = shape2.name;
    shape2.text.fontSize = 24;

    const container = figma.createFrame();
    container.layoutMode = "HORIZONTAL";
    container.itemSpacing = 16;
    container.appendChild(shape);
    container.appendChild(shape2);
    container.primaryAxisAlignItems = "SPACE_BETWEEN";
    container.name = "container";
    container.resize(400 + 400 + 16, 420);
    shape.resize(400, 400);
    shape2.resize(400, 400);

    const pollTitle = figma.createText();
    pollTitle.characters = `you like which kind of fruit?`;
    pollTitle.fontSize = 36;
    pollTitle.resize(pollTitle.width, pollTitle.fontSize * 1.25);
    pollTitle.name = "title";

    const containerWrapper = figma.createFrame();
    containerWrapper.layoutMode = "VERTICAL";
    containerWrapper.itemSpacing = 4;
    containerWrapper.appendChild(pollTitle);
    containerWrapper.appendChild(container);
    containerWrapper.paddingLeft = 4;
    containerWrapper.paddingRight = 4;
    containerWrapper.paddingTop = 4;
    containerWrapper.paddingTop = 4;
    containerWrapper.resize(
      400 + 400 + 16,
      container.height + pollTitle.height + 4
    );

    // store in clientStorage
    figma.clientStorage.getAsync(USER_DATA_ENDPOINT).then((data) => {
      const _data = [...data, containerWrapper.id];
      figma.clientStorage.setAsync(USER_DATA_ENDPOINT, _data);
    });
  } else if (msg.type === "remove-counters") {
    figma.clientStorage.getAsync(USER_DATA_ENDPOINT).then(async (data) => {
      data?.forEach((itemID: string) => {
        const element = figma.currentPage.findChild((e) => e.id === itemID);
        if (element) {
          element.remove();
        }
      });
      figma.clientStorage.setAsync(USER_DATA_ENDPOINT, []);
    });
  } else if (msg.type === "find-counter") {
    figma.clientStorage.getAsync(USER_DATA_ENDPOINT).then(async (data) => {
      if (!data) return;
      let winnerIndex = -1;
      const countList = data?.map((itemID: string) => {
        const element: GroupNode = figma.currentPage.findChild(
          (e) => e.id === itemID
        ) as GroupNode;
        if (element) {
          const text = element.findChild((e) =>
            e.name.includes("text")
          ) as TextNode;
          const count = parseInt(text.name.slice(4), 10);
          return count || 0;
        }
        return 0;
      });
      winnerIndex = indexOflargest(countList);
      if (winnerIndex !== -1) {
        const toNode = [
          figma.currentPage.findChild((c) => c.id === data[winnerIndex]),
        ];
        figma.currentPage.selection = toNode;
        figma.viewport.scrollAndZoomIntoView(toNode);
      }
    });
  }
};

setInterval(() => {
  const allStampElements = figma.currentPage.findAll((e) => e.type === "STAMP");
  const allStampPos = allStampElements.map((element) => getElementPos(element));
  // check allStampPos if inside the counter:
  if (allStampPos) {
    figma.clientStorage.getAsync(USER_DATA_ENDPOINT).then(async (data) => {
      data?.forEach((itemID: string) => {
        const poll: FrameNode = figma.currentPage.findChild(
          (e) => e.id === itemID
        ) as FrameNode;
        // get Frame, find the sticky inside the group
        if (poll) {
          const options = poll.findChild(
            (e) => e.name === "container"
          ) as FrameNode;
          options?.children.map((option: ShapeWithTextNode) => {
            const areaPos = getElementPos(option);
            const count = calcStampInArea(areaPos, allStampPos);
            console.log(`calc...${option.name} | 🗳 ${count}`);
            option.text.characters = `${option.name} | 🗳 ${count}`;
          });
        }
      });
    });
  }
}, 1000);

const getElementPos = (element) => {
  return {
    x0: element.absoluteTransform[0][2],
    x1: element.absoluteTransform[0][2] + element.width,
    y0: element.absoluteTransform[1][2],
    y1: element.absoluteTransform[1][2] + element.height,
  };
};

const calcStampInArea = (area, stamps) => {
  let result = 0;
  stamps.forEach((stamp) => {
    if (
      stamp.x1 > area.x0 &&
      stamp.x0 < area.x1 &&
      stamp.y1 > area.y0 &&
      stamp.y0 < area.y1
    ) {
      result += 1;
    }
  });
  return result;
};

function indexOflargest(a) {
  return a.indexOf(Math.max.apply(Math, a));
}
