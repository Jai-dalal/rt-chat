import { useEffect, useRef, useState } from "react";
import { Input, Stack, IconButton } from "@chakra-ui/react";
import { BiSave, BiEdit } from "react-icons/bi";
import { useAppContext } from "../context/appContext";

export default function NameForm() {
  const { username, setUsername } = useAppContext();
  const [newUsername, setNewUsername] = useState(username);
  const [isEditing, setIsEditing] = useState(false);
  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };

  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current.focus();
    }
  }, [isEditing]);
  useEffect(() => {
    setNewUsername(username);
  }, [username]);
  const handleSubmit = (e) => {
    e.preventDefault();
    toggleEditing();

    if (!newUsername) {
      setNewUsername(username);
      return;
    }
    // setUsername(newUsername);
    // setIsEditing(false);

    setUsername(newUsername);
    localStorage.setItem("username", newUsername);
  };

  const [showBorder, setUseBorder] = useState(false);
  const blur = () => {
    setUseBorder(true);
  };

  return (
    <form onSubmit={handleSubmit} className="center_very">
      {isEditing ? (
        <Input
          name="username"
          placeholder="Choose a username"
          onChange={(e) => setNewUsername(e.target.value)}
          value={newUsername}
          onBlur={blur}
          ref={inputRef}
          border="0"
          maxLength="15"
          className={`${showBorder === true ? "border-red" : "border-none"}`}
        />
      ) : (
        <span className="center_very gap-2">
          Welcome <strong> {newUsername}</strong>
        </span>
      )}
      <IconButton
        size="sm"
        variant="outline"
        colorScheme="teal"
        aria-label="Save"
        fontSize="16px"
        marginLeft="10px"
        className="pointer"
        icon={isEditing ? <BiSave /> : <BiEdit />}
        border="none"
        onClick={(e) => {
          if (isEditing) {
            handleSubmit(e);
          } else toggleEditing();
        }}
      />
    </form>
  );
}
