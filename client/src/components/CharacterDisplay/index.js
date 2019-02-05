import React from "react";

function CharacterDisplay(props) {
   
   if (props.character.name && props.character.initiativeBonus) {
      return (
         <div className="card grey">
            {/* {console.log(props)} */}
            <h4>{props.character.name}</h4>
            <hr></hr>
               <p>{props.character.initiativeBonus}</p>
         </div>
      );
   } else {
      return (
         <div className="card grey">Select a character to display.</div>
      );
   }
}

export default CharacterDisplay;