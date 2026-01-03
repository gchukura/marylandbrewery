import HeaderV2 from "@/components/home-v2/HeaderV2";
import FooterV2 from "@/components/home-v2/FooterV2";

export default function HomepageV2Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <HeaderV2 />
      <main className="flex-1 flex flex-col min-h-0">
        {children}
      </main>
      <div className="mt-auto flex-shrink-0">
        <FooterV2 />
      </div>
    </>
  );
}

