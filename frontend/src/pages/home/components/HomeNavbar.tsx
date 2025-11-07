export default function Navbar() {
  return (
    <div className='sticky top-0 z-50 w-full px-3 pt-3'>
      <nav className='border-bisonbrown bg-mainbrown relative z-10 mx-auto h-16 w-full rounded-lg border px-4 md:px-6'>
        <div className='grid h-full grid-cols-3 items-center'>
          <div />

          <a
            className='font-sourceserif4-18pt-light scale-x-90 cursor-pointer justify-self-center text-[30px] tracking-tight select-none'
            href='/'
          >
            BoilerMate
          </a>

          <div className='font-roboto-light flex items-center gap-7 justify-self-end text-lg'>
            <a href='/signin'>Sign In</a>
            <a href='/signup'>Sign Up</a>
          </div>
        </div>
      </nav>
    </div>
  );
}
