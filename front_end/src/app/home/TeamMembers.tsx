import React, { useState, useEffect } from "react";
import { Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,} from "@chakra-ui/modal"
import { Toaster, toaster } from "../src/components/ui/toaster"
import {
  Box,
  Button,
  Input,
  Select,
  useDisclosure,
  VStack,
  HStack,
  Text,
  Badge,
  Flex,
  Spacer,
  IconButton,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { FormControl, FormLabel } from "@chakra-ui/form-control";

interface Team {
  teamid: number;
  teamname: string;
  teamleaderemail: string;
  createdat: string;
  task_count: number;
  members: Member[];
  is_admin: boolean;
}

interface Member {
  memberemail: string;
  name: string;
  last: string;
}

const Teams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: "",
    members: [""],
  });

  const { open: isOpenMember, onOpen: onOpenMember, onClose: onCloseMember } = useDisclosure();
  const { open: isOpenTeam, onOpen: onOpenTeam, onClose: onCloseTeam } = useDisclosure();
  const [memberToRemove, setMemberToRemove] = useState<{ teamId: number; email: string } | null>(null);
  const [teamToDelete, setTeamToDelete] = useState<number | null>(null);
  const [newMemberEmail, setNewMemberEmail] = useState("");

  const showSuccess = (message: string) => toaster.create({ title: message, duration: 3000 });
  const showError = (message: string) => toaster.create({ title: message, duration: 3000 });

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/teams/getMembers", {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch teams");
      const data = await response.json();
      setTeams(Array.isArray(data) ? data : []);
    } catch (err) {
      showError(err instanceof Error ? err.message : "Error fetching teams");
    }
  };

  const handleCreateTeam = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/teams/create", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamName: newTeam.name,
          members: newTeam.members.filter((email) => email),
        }),
      });

      if (response.ok) {
        setShowCreateForm(false);
        setNewTeam({ name: "", members: [""] });
        fetchTeams();
      }
    } catch (err) {
      console.error("Error creating team:", err);
    }
  };

  const handleUpdateTeam = async (teamId: number, field: string, value: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/teams/${teamId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });

      if (!response.ok) throw new Error(await response.text());
      showSuccess("Team updated successfully!");
      fetchTeams();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to update team");
    }
  }

  const handleRemoveMember = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/teams/${memberToRemove?.teamId}/removeMember/${memberToRemove?.email}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.ok) {
        fetchTeams();
        setMemberToRemove(null);
        onCloseMember();
      } else {
        console.error("Failed to update team:", await response.json());
      }
    } catch (err) {
      console.error("Error updating team:", err);
    }
  };

  const handleAddMember = async (teamId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/teams/${teamId}/addMember`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newMemberEmail }),
      });
      if (response.ok) {
        fetchTeams();
        setNewMemberEmail("");
      }
    } catch (err) {
      console.error("Error adding member:", err);
    }
  };

  const handleDeleteTeam = async () => {
    if (teamToDelete) {
      try {
        await fetch(`http://localhost:5000/api/teams/delete/${teamToDelete}`, {
          method: "DELETE",
          credentials: "include",
        });
        fetchTeams();
      } catch (err) {
        console.error("Error deleting team:", err);
      }
      setTeamToDelete(null);
      onCloseTeam();
    }
  };

  const handleLeaveTeam = async (teamId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/teams/${teamId}/leave`, {
        method: "PUT",
        credentials: "include",
      });

      if (response.ok) {
        fetchTeams();
        showSuccess("You have left the team successfully!");
      } else {
        showError("Failed to leave the team.");
      }
    } catch (err) {
      showError("Error leaving the team.");
    }
  };

  const TeamHeader = ({ team }: { team: Team }) => (
    <Flex
      p={4}
      align="center"
      bg="white"
      borderRadius="md"
      boxShadow="md"
      _hover={{ boxShadow: "lg" }}
      cursor="pointer"
      onClick={(e) => {
        e.stopPropagation();
        setSelectedTeam(selectedTeam === team.teamid ? null : team.teamid);
      }}
    >
      <VStack align="start">
        <HStack>
          <Text fontSize="xl" fontWeight="bold">
            {team.teamname}
          </Text>
          <Badge bg={team.is_admin ? "white" : "gray"} ml={2}>
            {team.is_admin ? "Admin" : "Member"}
          </Badge>
        </HStack>
        <Text fontSize="sm" color="gray.500">
          Created: {new Date(team.createdat).toLocaleDateString()} • 
          Tasks: {team.task_count} • 
          Members: {team.members.length}
        </Text>
      </VStack>
      <Spacer />
      <HStack>
        {team.teamname !== "My Tasks" && team.is_admin && (
          <IconButton
            size="sm"
            aria-label="Delete team"
            bg="red"
            ml={"10"}
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              setTeamToDelete(team.teamid);
              onOpenTeam();
            }}
          >
          <DeleteIcon size="sm"/>
          </IconButton>
        )}
      </HStack>
    </Flex>
  );
  const TeamDetails = ({ team }: { team: Team }) => {
    const [teamNameDraft, setTeamNameDraft] = useState(team.teamname);

    return (
      <VStack color={"black"} mt={4} p={4} bg="gray.50" borderRadius="md" align="stretch">
        <HStack align="end">
          <FormControl flex={1}>
            <FormLabel>Team Name</FormLabel>
            <HStack>
              <Input
                value={teamNameDraft}
                onChange={(e) => setTeamNameDraft(e.target.value)}
                disabled={!team.is_admin}
              />
              <Button
                colorScheme="blue"
                onClick={() => handleUpdateTeam(team.teamid, "teamName", teamNameDraft)}
                disabled={!team.is_admin || teamNameDraft === team.teamname}
              >
                Save
              </Button>
            </HStack>
          </FormControl>

          <FormControl color={"black"} flex={1}>
            <FormLabel>Team Leader</FormLabel>
            <HStack>
              
              <select
                style={{background:"white"}}
                value={team.teamleaderemail}
                onChange={(e) => {
                  const updatedTeams = teams.map((t) =>
                    t.teamid === team.teamid ? { ...t, teamleaderemail: e.target.value } : t
                  );
                  setTeams(updatedTeams);
                }}
                disabled={!team.is_admin}
              >
                {team.members.map((member) => (
                  <option key={member.memberemail} value={member.memberemail}>
                    {member.name} {member.last} ({member.memberemail})
                  </option>
                ))}
              </select>
              <Button
                colorScheme="blue"
                onClick={() => handleUpdateTeam(team.teamid, "newLeaderEmail", team.teamleaderemail)}
                disabled={!team.is_admin}
              >
                Save
              </Button>
            </HStack>
          </FormControl>
        </HStack>

        <VStack align="stretch">
          <Text fontWeight="bold">Members</Text>
          {team.is_admin && (
            <HStack>
              <Input
                placeholder="Add member by email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
              />
              <AddIcon
                size="sm"
                bgColor="white"
                onClick={() => handleAddMember(team.teamid)}
                disabled={!newMemberEmail.trim()}
              >
                Add Member
              </AddIcon>
            </HStack>
          )}
          
          {team.members.map((member) => (
            <Flex
              key={member.memberemail}
              p={2}
              bg="white"
              borderRadius="md"
              align="center"
              justify="space-between"
            >
              <Box>
                <Text fontWeight="medium">{member.name} {member.last}</Text>
                <Text fontSize="sm" color="gray.600">{member.memberemail}</Text>
              </Box>
              {team.is_admin && member.memberemail !== team.teamleaderemail && (
                <IconButton
                  aria-label="Remove member"
                  bg="red"
                  variant="ghost"
                  onClick={() => {
                    setMemberToRemove({ teamId: team.teamid, email: member.memberemail });
                    onOpenMember();
                  }}>
                    <DeleteIcon size="sm"/>
                    </IconButton>
              )}
            </Flex>
          ))}
        </VStack>
        {!team.is_admin && (
        <Button
          bg="red"
          onClick={() => handleLeaveTeam(team.teamid)}
        >
          Leave Team
        </Button>
      )}
      </VStack>
    );
  };

  return (
    <Box p={8} maxW="4xl" mx="auto" color={"black"}>
      <HStack mb={4}>
        <Text fontSize="2xl" fontWeight="bold">
          Create New Team?
        </Text>
        <IconButton
          aria-label={showCreateForm ? "Cancel Creation" : "Create New Team"}
          size="lg"
          onClick={() => setShowCreateForm(!showCreateForm)}
          bgColor="white"
          color="yellow.600"
        >
        <AddIcon size="2xl"/>
        </IconButton>
      </HStack>

      {/* Create Team Form */}
      {showCreateForm && (
        <VStack p={4} bg="white" boxShadow="md" borderRadius="md" align="stretch" mb={8}>
          <FormControl>
            <FormLabel>Team Name</FormLabel>
            <Input
              value={newTeam.name}
              onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
              placeholder="Enter team name"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Team Members</FormLabel>
            <VStack align="stretch" >
              {newTeam.members.map((email, index) => (
                <HStack key={index}>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      const newMembers = [...newTeam.members];
                      newMembers[index] = e.target.value;
                      setNewTeam({ ...newTeam, members: newMembers });
                    }}
                    placeholder="member@example.com"
                  />
                  <IconButton
                    aria-label="Remove member"
                    colorScheme="red"
                    onClick={() => setNewTeam({
                      ...newTeam,
                      members: newTeam.members.filter((_, i) => i !== index)
                    })}
                  >
                    <DeleteIcon size="sm"/>
                    </IconButton>
                </HStack>
              ))}
              <AddIcon 
                size="sm"
                onClick={() => setNewTeam({ ...newTeam, members: [...newTeam.members, ""] })}
                variant="outline"
              >
                Add Member
              </AddIcon>
            </VStack>
          </FormControl>

          <Button
            onClick={handleCreateTeam}
            colorScheme="green"
            disabled={!newTeam.name.trim() || newTeam.members.some(e => !e.trim())}
          >
            Create Team
          </Button>
        </VStack>
      )}

      {/* Teams List */}
      <VStack align="stretch">
        {teams.map((team) => (
          <Box key={team.teamid}>
            <TeamHeader team={team} />
            {selectedTeam === team.teamid && team.teamname !== "My Tasks" && (
              <TeamDetails team={team} />
            )}
          </Box>
        ))}
      </VStack>

      {/* Confirmation Modals */}
      <Modal isOpen={isOpenMember} onClose={onCloseMember}>
        <ModalOverlay />
        <ModalContent
          bg="white"
          color="black"
          width="25%"
          position="fixed"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
        >
          <ModalHeader>Remove Member</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to remove this member?
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCloseMember}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleRemoveMember}>
              Remove
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isOpenTeam} onClose={onCloseTeam}>
        <ModalOverlay />
        <ModalContent bg={"white"} rounded={"2xl"} color={"black"} ml={"35%"} mt={"15%"} width="25%">
          <ModalHeader color={"white"} bg={"red"}>Delete Team</ModalHeader>
          <ModalCloseButton color={"white"} p={3} position="absolute" top="0rem" right="0rem" />
          <ModalBody >
            Are you sure you want to permanently delete this team?
            <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCloseTeam}>
              Cancel
            </Button>
            <Button color="red" onClick={handleDeleteTeam}>
              Delete
            </Button>
            </ModalFooter>
          </ModalBody>

        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Teams;