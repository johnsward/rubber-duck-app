"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import { useSpring, animated } from "@react-spring/web";

interface DuckProps {
  width?: number,
  height?: number,
  isAnimated: boolean,
}

const RubberDuck: React.FC<DuckProps> = ({width, height, isAnimated }) => {
  const [scalingAnimation, scalingApi] = useSpring(() => ({
    from: { scale: 0.8 },
    to: { scale: 1.0 },
    config: { tension: 300, friction: 15, duration: 2000 },
  }));

  // Spring for periodic bouncing effect
  const [bounceAnimation, bounceApi] = useSpring(() => ({
    from: { y: 0 },
    config: { tension: 300, friction: 10 },
  }));

  // Trigger the scaling animation on page load
  useEffect(() => {
    scalingApi.start({ from: { scale: 0.8 }, to: { scale: 1.0 } });
  }, [scalingApi]);

  // Trigger the bouncing effect periodically
  useEffect(() => {
    const bounceInterval = setInterval(() => {
      bounceApi.start({
        from: { y: 0 },
        to: { y: -5 }, // Bounce up
        reset: true,
        onRest: () => bounceApi.start({ y: 0 }), // Return to original position
      });
    }, 2000);

    return () => clearInterval(bounceInterval); // Clean up interval on unmount
  }, [bounceApi]);

  const combinedAnimation = {
    ...scalingAnimation,
    ...bounceAnimation,
  };
  

  return (
    <animated.div
      style={ isAnimated ? combinedAnimation : {} }
      className="flex align-middle justify-end"
    >
      <Image
        src="/images/rubberducktransparent.png"
        alt="Friendly rubber Duck"
        style={{width: width, height: height }}
        width={width=600}
        height={height= 600}
      />
    </animated.div>
  );
};

export default RubberDuck;
