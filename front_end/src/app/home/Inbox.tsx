'use client';
import React, { useState, useEffect, useRef } from 'react';
import { IoMdSend } from 'react-icons/io';
import { IoMdArrowRoundBack } from "react-icons/io";
import { Box, Input, Button, IconButton, Text, Flex } from '@chakra-ui/react';

interface Message {
  inboxid: number;
  commenterid: number;
  commenttext: string;
  createdat: string;
  name: string;
  last:string;
  isMine: boolean;
}

interface Team {
  teamid: number;
  teamname: string;
}

const Inbox = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/inbox/teams", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      setTeams(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching teams:", err);
      setTeams([]);
    }
  };

  const fetchMessages = async (teamId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/inbox/messages`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId }),
      });
      const data = await res.json();
      setMessages(Array.isArray(data) ? data.reverse() : []);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setMessages([]);
    }
  };

  useEffect(() => {
    if (selectedTeam) {
      fetchMessages(selectedTeam);
      setupWebSocket(selectedTeam);
    }
  }, [selectedTeam]);

  const setupWebSocket = (teamId: string) => {
    if (socketRef.current) {
      socketRef.current.close();
    }

    const ws = new WebSocket(`ws://localhost:5000/ws?teamId=${teamId}`);
    socketRef.current = ws;

    ws.onopen = () => console.log("WebSocket connected");
    ws.onclose = () => console.log("WebSocket closed");

    ws.onmessage = async (event) => {
      try {
        let newMessage = event.data instanceof Blob ? JSON.parse(await event.data.text()) : JSON.parse(event.data);

        if (newMessage && newMessage.commenttext.trim()) {
          setMessages((prev) => [...prev, newMessage]);
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    ws.onerror = (error) => console.error("WebSocket error:", error);
  };
  

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim() || !selectedTeam) return;
  
    try {
      const res = await fetch('http://localhost:5000/api/inbox/send', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId: Number(selectedTeam), message: message.trim(), taskId: null }),
      });
  
      if (res.ok) {
        const savedMessage = await res.json();
        setMessages((prev) => [...prev, { ...savedMessage, isMine: true, name: savedMessage.name, last: savedMessage.last }]);
        setMessage('');
        setTimeout(() => {
          if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            const msgToSend = { ...savedMessage };
  
            if (msgToSend.commenttext.trim()) {
              socketRef.current.send(JSON.stringify(msgToSend));
            }
          }
        }, 300);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };
  

  return (
    <Box h="100vh" bg="white" display="flex" flexDirection="column" w="full">
    {/* Team List / Selected Team Header */}
    <Box bg="white" p={4} borderBottomWidth={1}>
      {selectedTeam ? (
        <Flex align="center" gap={3}>
          <Button bgColor={"white"} onClick={() => setSelectedTeam(null)} size="sm" bg="gray.300"><IoMdArrowRoundBack color='black'/></Button>
          <Text fontSize="lg" fontWeight="bold" color="black">
            {teams.find((team) => team.teamid.toString() === selectedTeam)?.teamname}
          </Text>
        </Flex>
      ) : (
        teams.map((team) => (
          <Flex
            key={team.teamid}
            align="center"
            p={3}
            gap={3}
            cursor="pointer"
            borderBottom="1px solid #ddd"
            _hover={{ bg: "gray.100" }}
            onClick={() => setSelectedTeam(team.teamid.toString())}
          >
            <Box w="40px" h="40px" borderRadius="full" bg="gray.300" display="flex" alignItems="center" justifyContent="center">
              🏆
            </Box>
            <Text fontSize="lg" fontWeight="bold" color="black">{team.teamname}</Text>
          </Flex>
        ))
      )}
    </Box>

    {/* Messages Section */}
    {selectedTeam && (
      <Box flex={1} p={4} bg="gray.50" overflowY="auto" display="flex" flexDirection="column">
        {messages.length > 0 && messages.map((msg, i) => (
          <React.Fragment key={msg.inboxid}>
            {i === 0 || formatDate(messages[i - 1].createdat) !== formatDate(msg.createdat) ? (
              <Text textAlign="center" color="gray.500" fontSize="sm" my={2}>
                {formatDate(msg.createdat)}
              </Text>
            ) : null}
            <Flex direction="column" align={msg.isMine ? "flex-end" : "flex-start"} mb={4}>
              <Box p={1}>
              <Text color={"black"}>{msg.name + " " + msg.last}</Text>
              </Box>
              <Box p={3} borderRadius="lg" bg={msg.isMine ? "blue.100" : "yellow.100"} color="gray.800" maxW="70%">
                <Text>{msg.commenttext}</Text>
                <Text fontSize="xs" color="gray.600" textAlign="right">{formatTime(msg.createdat)}</Text>
              </Box>
            </Flex>
          </React.Fragment>
        ))}
        <div ref={messagesEndRef} />
      </Box>
    )}

    {/* Message Input */}
    {selectedTeam && (
      <Box p={4} bg="white" borderTopWidth={1}>
        <Flex gap={2}>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="New Message"
            flex={1}
            color="black"
          />
          <IconButton aria-label="Send" bg="green.500" onClick={sendMessage}>
            <IoMdSend />
          </IconButton>
        </Flex>
      </Box>
    )}
  </Box>
);
};

export default Inbox;
