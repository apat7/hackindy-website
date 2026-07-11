import GarageCanvas from "@/components/GarageCanvas";

export const metadata = {
  title: "HackIndy 2027 · Garage (WIP)",
};

export default function Garage() {
  return (
    <main className="w-screen h-screen overflow-hidden">
      <GarageCanvas />
    </main>
  );
}
