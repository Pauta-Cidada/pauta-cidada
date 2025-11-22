import { Button } from '../ui/button';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { MenuIcon, XCircle } from 'lucide-react';
import Logo from '@/assets/logo.png';
import Github from '@/assets/github.png';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from '../ui/navigation-menu';

export default function Menu() {
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <nav className="bg-gray-900 z-50 flex items-center justify-between md:gap-4 md:py-3 py-0 px-6 md:px-24 sticky top-0 border-b border-gray-700">
        <div className="w-auto">
          <img src={Logo} width={110} />
        </div>

        {/* Links de navegação para telas médias */}
        <section
          className={
            'invisible md:visible md:w-full md:flex md:justify-between md:ml-12'
          }
        >
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Button
                  variant="link"
                  className="text-white text-md font-semibold"
                  onClick={() => navigate(`/`)}
                >
                  Notícias
                </Button>
              </NavigationMenuItem>
            </NavigationMenuList>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Button
                  variant="link"
                  className="text-white text-md font-semibold"
                  onClick={() => navigate(`/`)}
                >
                  Sobre
                </Button>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Chamada para contribuição open source em dispositivos médios */}
          <div className="flex gap-3 items-center">
            <a
              href="https://github.com/Pauta-Cidada"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white text-md font-semibold hover:underline"
            >
              Contribua para o nosso projeto
            </a>
            <a
              href="https://github.com/Pauta-Cidada"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={Github}
                className="w-[40px] hover:opacity-80 transition-opacity"
              />
            </a>
          </div>
        </section>

        {/* Botão de Menu - Mobile */}
        <section className="md:hidden">
          {!isMenuOpen && (
            <MenuIcon
              width={25}
              height={25}
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="text-white cursor-pointer"
            />
          )}

          {isMenuOpen && (
            <XCircle
              width={25}
              height={25}
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="text-white cursor-pointer"
            />
          )}
        </section>
      </nav>

      {/* Exibição do menu para telas mobiles */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900 border-b border-gray-700 p-6 flex flex-col gap-6 shadow-xl animate-in slide-in-from-top-5">
          <section className="w-full flex flex-col items-start gap-y-4">
            <Button
              variant="link"
              className="text-white text-lg font-semibold p-0 h-auto"
              onClick={() => {
                navigate(`/`);
                setIsMenuOpen(false);
              }}
            >
              Notícias
            </Button>
            <Button
              variant="link"
              className="text-white text-lg font-semibold p-0 h-auto"
              onClick={() => {
                navigate(`/`);
                setIsMenuOpen(false);
              }}
            >
              Sobre
            </Button>
          </section>

          {/* Chamada para contribuição open source em dispositivos móveis */}
          <section className="w-full flex items-center gap-3">
            <a
              href="https://github.com/Pauta-Cidada"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <img
                src={Github}
                className="w-[35px] hover:opacity-80 transition-opacity"
                alt="Github"
              />
            </a>
            <a
              href="https://github.com/Pauta-Cidada"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white text-md font-semibold hover:underline"
            >
              Contribua para o nosso projeto
            </a>
          </section>
        </div>
      )}
    </>
  );
}
