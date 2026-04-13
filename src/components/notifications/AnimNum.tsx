import { useSpring, animated } from "@react-spring/web";

export function AnimNum({ value }: { value: number }) {
  const { val } = useSpring({ val: value, config: { tension: 180, friction: 22 } });
  return <animated.span>{val.to((v) => Math.round(v))}</animated.span>;
}