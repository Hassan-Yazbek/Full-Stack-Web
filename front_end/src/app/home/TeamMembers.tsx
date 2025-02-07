import React, { useState, useEffect } from "react";

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
    members: [""]
  });

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/teams/getMembers", {
        method: "GET",
        credentials: "include"
      });
      const data = await response.json();
      const teamsWithMembers = data.map((team: { members: any; }) => ({
        ...team,
        members: team.members || []
      }));
      setTeams(Array.isArray(teamsWithMembers) ? teamsWithMembers : []);
    } catch (err) {
      console.error("Error fetching teams:", err);
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
          members: newTeam.members.filter(email => email)
        })
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
      await fetch(`http://localhost:5000/api/teams/${teamId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value })
      });
      fetchTeams();
    } catch (err) {
      console.error("Error updating team:", err);
    }
  };

  const confirmRemoveMember = (teamId: number, memberEmail: string) => {
    if (window.confirm("Are you sure you want to remove this member?")) {
      handleUpdateTeam(teamId, 'removeMember', memberEmail);
    }
  };

  const generateRandomKey = () => {
    return `${Date.now()}-${Math.floor(Math.random() * 1000)}+${Math.floor(Math.random() * 1000)}`;
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <button
        onClick={() => setShowCreateForm(!showCreateForm)}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        {showCreateForm ? "Cancel" : "Create New Team"}
      </button>

      {showCreateForm && (
        <div className="mb-8 p-4 border rounded">
          <input
            type="text"
            value={newTeam.name}
            onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
            placeholder="Team name"
            className="border p-2 w-full mb-2"
          />
          
          {newTeam.members.map((email, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  const newMembers = [...newTeam.members];
                  newMembers[index] = e.target.value;
                  setNewTeam({...newTeam, members: newMembers});
                }}
                placeholder="Member email"
                className="border p-2 flex-grow mr-2"
              />
              <button
                onClick={() => setNewTeam({
                  ...newTeam,
                  members: newTeam.members.filter((_, i) => i !== index)
                })}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Remove
              </button>
            </div>
          ))}
          
          <button
            onClick={() => setNewTeam({...newTeam, members: [...newTeam.members, ""]})}
            className="bg-gray-200 px-4 py-2 rounded mb-2"
          >
            Add Member
          </button>
          
          <button
            onClick={handleCreateTeam}
            className="bg-green-500 text-white px-4 py-2 rounded block w-full"
          >
            Create Team
          </button>
        </div>
      )}

      {teams.map((team) => (
        <div key={team.teamid} className="border p-4 mb-4 rounded-lg shadow-sm">
          <div 
            className="flex justify-between items-center cursor-pointer"
            onClick={() => setSelectedTeam(selectedTeam === team.teamid ? null : team.teamid)}
          >
            <div>
              <h3 className="text-xl font-bold">{team.teamname}</h3>
              <p className="text-sm text-gray-600">
                Created: {new Date(team.createdat).toLocaleDateString()} • 
                Tasks: {team.task_count} • 
                Members: {team.members ? team.members.length : 0}
              </p>
            </div>
            <span className={`badge ${team.is_admin ? 'bg-blue-500' : 'bg-gray-300'} text-white px-2 py-1 rounded`}>
              {team.is_admin ? "Admin" : "Member"}
            </span>
          </div>
          
          {selectedTeam === team.teamid && (
            <div className="mt-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block font-bold mb-2">Team Name</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={team.teamname}
                      onChange={(e) => handleUpdateTeam(team.teamid, 'teamName', e.target.value)}
                      className="border p-2 flex-grow"
                      disabled={!team.is_admin}
                    />
                    {team.is_admin && (
                      <button
                        onClick={() => handleUpdateTeam(team.teamid, 'teamName', team.teamname)}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                      >
                        Save
                      </button>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block font-bold mb-2">Team Leader</label>
                  <select
                    value={team.teamleaderemail}
                    onChange={(e) => handleUpdateTeam(team.teamid, 'newLeaderEmail', e.target.value)}
                    className="border p-2 w-full"
                    disabled={!team.is_admin}
                  >
                    {team.members.map((member) => (
                      <option key={member.memberemail} value={member.memberemail}>
                        {member.name} {member.last} ({member.memberemail})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <h4 className="font-bold mb-2">Members:</h4>
              {team.members.map((member, index) => (
                <div key={`${team.teamid}-${member.memberemail}`} className="flex justify-between items-center mb-2 p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{member.name} {member.last}</p>
                    <p className="text-sm text-gray-600">{member.memberemail}</p>
                  </div>
                  {team.is_admin && member.memberemail !== team.teamleaderemail && (
                    <button
                      onClick={() => confirmRemoveMember(team.teamid, member.memberemail)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Teams;
