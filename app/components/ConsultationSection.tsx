export default function ConsultationSection() {
  return (
    <section
      className="relative w-full min-h-[600px] bg-fixed bg-center bg-cover bg-no-repeat flex items-center justify-end px-6 md:px-12"
      style={{ backgroundImage: "url('/secondSectionImage.webp')" }}
    >
      <div className="bg-[#00332D]/90 text-white p-6 md:p-12 w-full md:w-[600px] backdrop-blur-sm rounded-md flex flex-col items-center justify-center text-center">
        <h2 className="text-xl md:text-1xl font-semibold mb-6">
          UZZINIET, CIK MAKSĀ JŪSU ĪPAŠUMS<br />
          UN CIK ILGĀ LAIKĀ<br />
          TO VAR PĀRDOT
        </h2>

        <button className="bg-white text-[#00332D] font-semibold text-sm px-6 py-4 rounded-md border-2 border-white hover:bg-transparent hover:text-white transition duration-300 ease-in-out">
          SAŅEMT MŪSU SPECIĀLISTA BEZMAKSAS KONSULTĀCIJU
        </button>
      </div>
    </section>
  )
}
