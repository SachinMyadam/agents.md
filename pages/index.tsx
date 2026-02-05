import dynamic from "next/dynamic";

const PermitPilotApp = dynamic(
  () => import("@/components/permitpilot/PermitPilotApp"),
  { ssr: false }
);

export default function Home() {
  return <PermitPilotApp />;
}
