import React from "react";

type InputEvent = React.ChangeEvent<HTMLInputElement>;

export default function FakeSignIn({ onChange } : { onChange: React.Dispatch<React.SetStateAction<string>>}) {

  function handleUserIdChange(userId: string) {
    console.log('confirm password actually changing')
    onChange(userId)
  }
  return (
    <div>
      <input onChange={(e) => { handleUserIdChange(e.target.value) }} placeholder="Input your user id here" />
    </div>
  );
}