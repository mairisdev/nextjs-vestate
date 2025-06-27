import Image from 'next/image'

const leftList = [
  'Cilvēkiem pašiem nav laika vai vēlēšanās iedziļināties procesā un nodarboties ar pārdošanu;',
  'Cilvēkiem nav pieredzes īpašuma pārdošanā, viņi nepārzina nozares tirgu, nevar noteikt optimālo pārdošanas cenu;',
  'Cilvēki baidās, ka viņus apkrāps vai trāpīsies negodprātīgi pircēji, baidās pieļaut būtiskas kļūdas noformēšanas procesā;',
  'Cilvēki saprot, ka aģents ir profesionālis, ka tam ir tīkla kontakti un klientu piesaistes iespējas plašākas, un ka aģents pārdos īpašumu dārgāk nekā pats klients;',
]

const rightList = [
  'Cilvēkiem nav vajadzīgo zināšanu nekustamā īpašuma nodokļu jautājumos;',
  'Cilvēkiem pašu spēkiem ilgstoši neizdodas pārdot īpašumu;',
  'Cilvēki neprot vai nevēlas paši komunicēt ar daudziem svešiem cilvēkiem, bieži vien ir vīlušies starpniekos;',
  'Cilvēkiem pašam ir grūti pateikt nē uzmācīgiem pircējiem vai prasīt ievērojamu atlīdzību;',
  'Cilvēki saprot, ka tāda sarežģīta un nopietna lieta, kā īpašuma pārdošana jāuztic profesionāļiem;',
]

export default function AgentReasons() {
  return (
<section className="bg-[#F3F4F6] py-16 px-4 md:px-12">
  <div className="max-w-[1600px] mx-auto">
    
    {/* Virsraksts virs layout */}
    <h2 className="text-2xl md:text-3xl font-semibold text-[#00332D] mb-12 text-center lg:text-left">
      Daži iemesli kāpēc <br className="hidden md:inline" />
      vajadzētu izvēlēties mākleri:
    </h2>

    {/* Tikai saraksts un bilde rindā */}
    <div className="flex flex-col lg:flex-row items-center gap-12">
      
      {/* Saraksts */}
      <div className="flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8 text-sm text-[#00332D]">
          {[leftList, rightList].map((list, listIdx) => (
            <ul key={listIdx} className="space-y-8">
              {list.map((text, idx) => {
                const number = listIdx === 0 ? idx + 1 : idx + 1 + leftList.length;
                return (
                  <li key={number} className="flex items-center gap-4">
                    <div className="w-9 h-9 flex items-center justify-center border-2 border-[#77D4B4] rounded-full text-[#77D4B4] font-bold text-base shrink-0">
                      {number}.
                    </div>
                    <p className="text-base leading-relaxed">{text}</p>
                  </li>
                );
              })}
            </ul>
          ))}
        </div>
      </div>

      {/* Attēls centrēts attiecībā pret sarakstu */}
      <div className="flex-1 flex items-center justify-center">
        <Image
          src="/AgentReasons.webp"
          alt="Mākleris nodod atslēgas"
          width={700}
          height={700}
          className="w-full h-auto rounded-md object-cover"
        />
      </div>
    </div>

  </div>
</section>
  )
}
