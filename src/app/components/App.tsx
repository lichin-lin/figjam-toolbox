import {
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerOverlay,
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
    <Button
      width="100%"
      fontSize="sm"
      padding="2"
      color="gray.600"
      background="gray.200"
      border="2px"
      borderColor="gray.300"
      borderRadius="md"
      {...props}
    >
      {children}
    </Button>
  );
};
const App = ({}) => {
  const [options, setOptions] = React.useState<OptionType[]>([]);
  const [pollTitle, setPollTitle] = React.useState<string>();
  const {isOpen, onOpen, onClose} = useDisclosure();
  const btnRef = React.useRef();
  const onAddPoll = () => {
    onOpen();
    setOptions([
      {
        title: 'option1',
      },
      {
        title: 'option2',
      },
    ]);
    return;
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
  const onRemove = () => {
    parent.postMessage({pluginMessage: {type: 'remove-counters'}}, '*');
  };
  // const onFind = () => {
  //   parent.postMessage({pluginMessage: {type: 'find-counter'}}, '*');
  // };
  React.useEffect(() => {
    window.onmessage = (event) => {
      const {type, message} = event.data.pluginMessage;
      console.log(type, message);
    };
  }, []);

  return (
    <VStack width="100%" padding="8">
      <VCButton ref={btnRef} onClick={onAddPoll}>
        🗳 &nbsp; Add a Poll
      </VCButton>
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
              <Text color="gray.600" fontSize="sm" fontWeight="bold" marginBottom="1">
                Options
              </Text>
              <VStack minHeight="100px" width="100%">
                {options.map((option, id) => (
                  <InputGroup size="sm" paddingRight="1">
                    <Input
                      pr="4.5rem"
                      variant="filled"
                      borderRadius="md"
                      value={option?.title}
                      onChange={(e) => onEditOption(e, id)}
                      size="sm"
                    />
                    <InputRightElement width="4.5rem">
                      <Button
                        h="1.5rem"
                        size="xs"
                        borderRadius="md"
                        onClick={() => onDeleteOption(id)}
                        colorScheme="gray"
                        borderWidth="2px"
                        borderColor="gray.300"
                      >
                        Delete
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                ))}
              </VStack>
            </VStack>
          </DrawerBody>

          <DrawerFooter paddingX="4" paddingY="2" borderTop="1px" borderColor="gray.100">
            <Button variant="outline" mr={3} onClick={onClose} size="sm">
              Cancel
            </Button>
            <Button colorScheme="blue" size="sm" onClick={onSubmitPoll}>
              Create
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <VCButton onClick={onRemove}>♻️ &nbsp; clean up data</VCButton>
      {/* <VCButton onClick={onFind}>👑 &nbsp; find winner</VCButton> */}
    </VStack>
  );
};
export default App;
