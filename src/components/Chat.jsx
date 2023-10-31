import { Badge, Box, Container } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useAppContext } from "../context/appContext";
import Messages from "./Messages";
import { BsChevronDoubleDown } from "react-icons/bs";
import MessageForm from "./MessageForm";

export default function Chat() {
  const [height, setHeight] = useState(window.innerHeight - 205);
  const {
    scrollRef,
    onScroll,
    scrollToBottom,
    isOnBottom,
    unviewedMessageCount,
  } = useAppContext();
  useEffect(() => {
    window.addEventListener("resize", () => {
      setHeight(window.innerHeight - 205);
    });
  }, []);

  return (
    <Container className="real_conat" maxW="600px" p="0px" mt="50px">
      <Box
        className="main_container"
        bg="white"
        p="5"
        overflow="auto"
        height={height}
        onScroll={onScroll}
        ref={scrollRef}
      >
        <Messages />
        {!isOnBottom && (
          <div
            style={{
              position: "sticky",
              bottom: 8,
              // right: 0,
              float: "right",
              cursor: "pointer",
            }}
            onClick={scrollToBottom}
          >
            {unviewedMessageCount > 0 ? (
              <Badge
                ml="1"
                fontSize="0.8em"
                colorScheme="green"
                display="flex"
                borderRadius="7px"
                padding="3px 5px"
                alignItems="center"
              >
                {unviewedMessageCount}
                <BsChevronDoubleDown style={{ marginLeft: "3px" }} />
              </Badge>
            ) : (
              <BsChevronDoubleDown style={{ marginLeft: "3px" }} />
            )}
          </div>
        )}
      </Box>
      <MessageForm />
    </Container>
  );
}
