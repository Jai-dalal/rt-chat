import { Button, Grid, GridItem, Image } from "@chakra-ui/react";
import { FaGithub } from "react-icons/fa";

import { useAppContext } from "../context/appContext";
import NameForm from "./NameForm";
export default function Header() {
  const { username, setUsername, auth, randomUsername } = useAppContext();
  return (
    <header>
      <a href="/" className="logo">
        <Image src="/Logo.png" />
      </a>
      {auth.user() ? (
        <>
          <div className="details">
            Welcome, &nbsp;<strong>{username}</strong>
            <button
              className="header_cta"
              onClick={() => {
                const { error } = auth.signOut();
                if (error) return console.error("error signOut", error);
                const username = randomUsername();
                setUsername(username);
                localStorage.setItem("username", username);
              }}
            >
              Log out
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="details">
            <NameForm username={username} setUsername={setUsername} />
            <button
              className="header_cta"
              onClick={() =>
                auth.signIn({
                  provider: "github",
                })
              }
            >
              Login with GitHub
            </button>
          </div>
        </>
      )}
    </header>
  );
}
