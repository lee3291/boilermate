import React from "react";

export default function FakeSignIn({ onChange } : { onChange: React.Dispatch<React.SetStateAction<string>>}) {

  function handleUserIdChange(userId: string) {
    onChange(userId)
  }
  return (
    <div>
      <input onChange={(e) => { handleUserIdChange(e.target.value) }} placeholder="Input your user id here" />
    </div>
  );
}