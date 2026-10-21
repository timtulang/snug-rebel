import snugrebel_logo_white from '../assets/snugrebel_logo_white.svg';
import landpage_bg from '../assets/landpage_bg.png';
import left_img from '../assets/left.png';
import right_img from '../assets/right.png';
import star_div from '../assets/star_div.svg';

// Button Component
function ShopButton() {
  return (
    <button
      onClick={() => console.log('Shop New Arrivals clicked')}
      className="
        relative z-20 mt-8 px-6 py-3 
        bg-black text-white font-display font-extrabold text-sm tracking-widest uppercase
        border-2 border-white ring-2 ring-black
        transition-all duration-200 ease-out
        -skew-x-6
        
        /* Hover & Focus States */
        hover:bg-white hover:text-black 
        focus:outline-none focus:bg-white focus:text-black focus:ring-offset-2 focus:ring-white
        
        /* onClick (Active) State */
        active:scale-95 active:bg-gray-200 active:text-black
      "
    >
      {/* Counter-skew the text so it stays readable while the box is slanted */}
      <span className="block skew-x-6">Shop New Arrivals</span>
    </button>
  );
}

function CategoryButton({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <div 
      className="relative group cursor-pointer inline-block z-20" 
      onClick={onClick}
    >
      {/* Red offset background (Default State) */}
      <div className="
        absolute inset-0 bg-[#e60000] transform -skew-x-12 
        translate-x-2 translate-y-2 
        transition-all duration-200 ease-out
        
        /* Hover State: shadow extends further */
        group-hover:translate-x-3 group-hover:translate-y-3
        
        /* onClick (Active) State: shadow presses in */
        group-active:translate-x-0 group-active:translate-y-0
      " />
      
      {/* Black button foreground */}
      <button className="
        relative z-10 px-8 md:px-12 py-3 md:py-4 
        bg-black text-white font-display font-extrabold text-xl md:text-2xl tracking-wider uppercase
        transform -skew-x-12 border-2 border-black
        transition-all duration-200
        group-hover:bg-neutral-900 group-active:bg-black
        focus:outline-none
      ">
        <span className="inline-block transform skew-x-12">{text}</span>
      </button>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="bg-black w-full overflow-x-hidden">
      <section className="relative w-full h-screen flex flex-col items-center justify-center">

        <img
          src={landpage_bg}
          alt="Hero Background"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none z-10" />
        <div className="relative z-20 flex flex-col items-center justify-center px-4 w-full">
          
          <img
            src={snugrebel_logo_white}
            alt="Snug Rebel"
            className="w-[90%] max-w-[800px] object-contain drop-shadow-2xl pointer-events-none"
          />

          <ShopButton />
        </div>
        
      </section>


      <section className="relative w-full h-screen flex flex-col md:flex-row overflow-hidden bg-black">
        <div className="absolute top-0 left-0 w-full h-48 md:h-64 bg-gradient-to-b from-black via-black/50 to-transparent pointer-events-none z-40" />
        <div className="relative w-full md:w-1/2 h-1/2 md:h-full flex items-end justify-center pb-16 md:pb-32">
          <img 
            src={left_img} 
            alt="Best Sellers Background" 
            className="absolute inset-0 w-full h-full object-cover" 
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
          <CategoryButton 
            text="Best Sellers" 
            onClick={() => console.log('Best Sellers clicked')} 
          />
        </div>

        <div className="relative w-full md:w-1/2 h-1/2 md:h-full flex items-end justify-center pb-16 md:pb-32">
          <img 
            src={right_img} 
            alt="Catalogue Background" 
            className="absolute inset-0 w-full h-full object-cover" 
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
          <CategoryButton 
            text="Catalogue" 
            onClick={() => console.log('Catalogue clicked')} 
          />
        </div>

        {/* Center Star Graphic */}
        <img 
          src={star_div} 
          alt="Decorative Stars" 
          className="
            absolute left-1/2 top-1/2 
            transform -translate-x-1/2 -translate-y-1/2 
            z-30 h-[90vh] md:h-full w-auto 
            object-contain pointer-events-none drop-shadow-2xl
          " 
        />
        
      </section>
        </div>
  );
}