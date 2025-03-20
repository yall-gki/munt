import Image from "next/image";

export default function Home() {
  return (
    <>
      <div className="relative h-full w-[100vw]">
        <Image
          src="https://ethereum.org/_next/image/?url=%2F_next%2Fstatic%2Fmedia%2Fhero.94a1ecc4.png&w=1504&q=75"
          alt="Hero"
          fill
          className="absolute top-0 left-0 w-full h-full object-fill select-none"
        />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <h1 className="text-white text-4xl"></h1>
          <p className="text-white mt-2"></p>
        </div>
      </div>
    </>
  );
}
