import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerOverlay,
  Input,
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import * as React from 'react';
declare function require(path: string): any;

interface OptionType {
  title?: string;
}

const VCButton = ({children, ...props}) => {
  return (
    <Button width="100%" fontSize="sm" padding="2" {...props}>
      {children}
    </Button>
  );
};
const App = ({}) => {
  const [polls, setPolls] = React.useState([{title: 'werewkjfnejkngjrenkjreng', id: '123'}]);
  const [options, setOptions] = React.useState<OptionType[]>([]);
  const [pollTitle, setPollTitle] = React.useState<string>();
  const [stickys, setStickys] = React.useState<any[]>();
  const [selectedSticky, setSelectedSticky] = React.useState<any[]>([]);
  const {isOpen, onOpen, onClose} = useDisclosure();
  const btnRef = React.useRef();
  const onAddPoll = () => {
    onOpen();
    setOptions([
      {
        title: 'option 1',
      },
      {
        title: 'option 2',
      },
    ]);
    return;
  };
  const onAddOption = () => {
    setOptions((options) => [...options, {title: null}]);
  };
  const onEditOption = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    setOptions((options) => [...options.slice(0, id), {title: e.target.value}, ...options.slice(id + 1)]);
  };
  const onDeleteOption = (id: number) => {
    setOptions((options) => [...options.slice(0, id), ...options.slice(id + 1)]);
  };
  const onEditPollTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPollTitle(e.target.value);
  };
  const onSubmitPoll = () => {
    parent.postMessage({pluginMessage: {type: 'create-counter', data: {pollTitle, options}}}, '*');
    onClose();
  };
  const onSubmitStickys = () => {
    parent.postMessage({pluginMessage: {type: 'create-counter'}}, '*');
    onClose();
  };
  const onZoomToPoll = (id) => {
    parent.postMessage({pluginMessage: {type: 'select-counter', id}}, '*');
  };
  const onRemove = (ids: string[]) => {
    parent.postMessage({pluginMessage: {type: 'remove-counters', ids}}, '*');
  };
  const toggleEraser = () => {
    parent.postMessage({pluginMessage: {type: 'toggle-eraser'}}, '*');
  };
  // const onFind = () => {
  //   parent.postMessage({pluginMessage: {type: 'find-counter'}}, '*');
  // };
  const sortByCount = (a, b) => {
    return b?.count - a?.count;
  };
  React.useEffect(() => {
    window.onmessage = (event) => {
      const {type, message} = event.data.pluginMessage;
      if (type === 'sync-counters') {
        // console.log('stickys', message);
        setStickys(message);
      } else if (type === 'set-selectedSticky') {
        console.log('set-selectedSticky', message);
        setSelectedSticky(message);
      }
    };
  }, []);
  React.useEffect(() => {
    parent.postMessage({pluginMessage: {type: 'fetch-counters'}}, '*');
  }, []);

  return (
    <VStack width="100%" height="100%" padding="0" spacing="0">
      <Drawer isOpen={isOpen} placement="bottom" onClose={onClose} finalFocusRef={btnRef}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerBody padding="0">
            <VStack padding="4" alignItems="flex-start">
              <Text color="gray.600" fontSize="sm" fontWeight="bold" marginBottom="1">
                Poll name
              </Text>
              <Input placeholder="which kind of..." size="md" value={pollTitle} onChange={onEditPollTitle} />
            </VStack>
          </DrawerBody>

          <DrawerFooter paddingX="5" paddingY="2" borderTop="1px" borderColor="gray.100">
            <Button variant="outline" mr={3} onClick={onClose} size="sm">
              Cancel
            </Button>
            <Button colorScheme="blue" size="sm" onClick={onSubmitPoll}>
              Create
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      <VStack padding="4" paddingY="2" paddingTop="4" width="100%" borderTop="1px" borderColor="gray.200">
        <VCButton ref={btnRef} onClick={toggleEraser} colorScheme="gray">
          toggle eraser 🗑
        </VCButton>
      </VStack>
    </VStack>
  );
};
export default App;
