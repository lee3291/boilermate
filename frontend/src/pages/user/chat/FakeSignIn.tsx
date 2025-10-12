import React from "react";

type InputEvent = React.ChangeEvent<HTMLInputElement>;

export default function FakeSignIn({ onChange } : { onChange: React.Dispatch<React.SetStateAction<string>>}) {

  function handleUserIdChange(e: InputEvent) {
    onChange(e.target.value)
  }
  return (
    <div>
      <input onChange={handleUserIdChange} placeholder="Input your user id here" />
    </div>
  );
}