import {
  Box,
  Button,
  Center,
  Divider,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerOverlay,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
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
  const [polls, setPolls] = React.useState([]);
  const [options, setOptions] = React.useState<OptionType[]>([]);
  const [pollTitle, setPollTitle] = React.useState<string>();
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
  const onZoomToPoll = (id) => {
    parent.postMessage({pluginMessage: {type: 'select-counter', id}}, '*');
  };
  const onRemove = () => {
    parent.postMessage({pluginMessage: {type: 'remove-counters'}}, '*');
  };
  // const onFind = () => {
  //   parent.postMessage({pluginMessage: {type: 'find-counter'}}, '*');
  // };
  React.useEffect(() => {
    window.onmessage = (event) => {
      const {type, message} = event.data.pluginMessage;
      if (type === 'sync-polls') {
        console.log(message);
        setPolls(message);
      }
    };
  }, []);
  React.useEffect(() => {
    parent.postMessage({pluginMessage: {type: 'fetch-polls'}}, '*');
  }, []);

  return (
    <VStack width="100%" height="100%" padding="0">
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
            <Divider borderColor="gray.100"></Divider>
            <VStack padding="4" alignItems="flex-start">
              <HStack justifyContent="space-between" alignItems="center" width="100%" paddingRight="2">
                <Text color="gray.600" fontSize="sm" fontWeight="bold" marginBottom="1">
                  Options
                </Text>
                <Button size="xs" color="blue.500" variant="ghost" onClick={onAddOption}>
                  + ADD
                </Button>
              </HStack>
              <VStack minHeight="100px" width="100%">
                {options.map((option, id) => (
                  <InputGroup size="sm" paddingRight="1" key={id}>
                    <Input
                      pr="4.5rem"
                      variant="filled"
                      borderRadius="md"
                      value={option?.title}
                      placeholder="option..."
                      onChange={(e) => onEditOption(e, id)}
                      size="sm"
                    />
                    <InputRightElement width="4.5rem">
                      <Button
                        h="1.5rem"
                        size="xs"
                        borderRadius="md"
                        onClick={() => onDeleteOption(id)}
                        colorScheme="red"
                      >
                        Delete
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                ))}
              </VStack>
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
      <VStack flex="1" background="gray.50" width="100%" padding="4" spacing="4" overflowY="scroll">
        {polls.length > 0 ? (
          polls?.map((poll) => (
            <Box
              key={poll.id}
              boxShadow="sm"
              border="1px"
              borderColor="gray.200"
              padding="4"
              rounded="md"
              width="100%"
              onClick={() => onZoomToPoll(poll.id)}
              cursor={'pointer'}
            >
              <Text fontWeight="bold" color="gray.600">
                {poll?.title}
              </Text>
              <Text fontWeight="normal" color="gray.400" fontSize="xs">{`${poll?.options.length} option(s)`}</Text>
            </Box>
          ))
        ) : (
          <Center width="100%" height="100%" fontSize="sm" color="gray.500">
            👇 Start making your first polls
          </Center>
        )}
      </VStack>
      <VStack padding="4" paddingY="2" width="100%">
        <VCButton ref={btnRef} onClick={onAddPoll} colorScheme="blue">
          🗳 &nbsp; Add a Poll
        </VCButton>
        <VCButton onClick={onRemove} variant="ghost" size="xs" padding="4" color="red.500">
          Remove All Polls
        </VCButton>
      </VStack>
      {/* <VCButton onClick={onFind}>👑 &nbsp; find winner</VCButton> */}
    </VStack>
  );
};
export default App;
