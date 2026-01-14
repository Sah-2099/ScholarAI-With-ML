import { useState } from 'react';

const Flashcard = ({Flashcard, onToggleStar}) => {
    const [isFlipped, setIsFlipped] = useState(false);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };
    
  return <div>Flashcard</div>
};

export default Flashcard
