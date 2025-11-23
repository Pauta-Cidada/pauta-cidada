import { Button } from '../ui/button';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { MenuIcon, TrendingUp, XCircle } from 'lucide-react';
import Logo from '@/assets/logo.png';
import Github from '@/assets/github.png';
import TwitterLogo from '@/assets/twitter.png';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from '../ui/navigation-menu';

export default function Menu() {
  const navigate = useNavigate();
  const location = useLocation();

  const isNoticiasActive =
    location.pathname === '/noticias' ||
    location.pathname.startsWith('/noticia/') ||
    location.pathname === '/';

  const isEmAltaActive = location.pathname === '/tendencias';
  const isSobreActive = location.pathname === '/sobre';

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <nav className="bg-gray-900 z-50 flex items-center justify-between md:gap-4 md:py-3 md:px-24 sticky top-0 border-b border-gray-700">
        <div
          className="ml-3 cursor-pointer"
          onClick={() => navigate('/noticias')}
        >
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
                  className={`text-md font-semibold ${
                    isNoticiasActive ? 'text-purple-500' : 'text-white'
                  }`}
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
                  className={`text-md font-semibold ${
                    isEmAltaActive ? 'text-purple-500' : 'text-white'
                  }`}
                  onClick={() => navigate(`/tendencias`)}
                >
                  <TrendingUp />
                  Em Alta
                </Button>
              </NavigationMenuItem>
            </NavigationMenuList>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Button
                  variant="link"
                  className={`text-md font-semibold ${
                    isSobreActive ? 'text-purple-500' : 'text-white'
                  }`}
                  onClick={() => navigate(`/sobre`)}
                >
                  Sobre
                </Button>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Chamada para contribuição open source em dispositivos médios */}
          <div className="flex gap-3 items-center">
            <a
              href="https://x.com/PautaCidada"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white text-md font-semibold hover:underline"
            >
              Participe da discussão
            </a>
            <a
              href="https://x.com/PautaCidada"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={TwitterLogo}
                className="w-[30px] hover:opacity-80 transition-opacity"
                alt="X / Twitter"
              />
            </a>
            <a
              href="https://github.com/Pauta-Cidada"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={Github}
                className="w-[30px] hover:opacity-80 transition-opacity"
              />
            </a>
          </div>
        </section>

        {/* Botão de Menu - Mobile */}
        <section className="md:hidden mr-3">
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
              className={`text-lg font-semibold p-0 h-auto ${
                isNoticiasActive ? 'text-purple-500' : 'text-white'
              }`}
              onClick={() => {
                navigate(`/`);
                setIsMenuOpen(false);
              }}
            >
              Notícias
            </Button>
            <Button
              variant="link"
              className={`text-lg font-semibold p-0 h-auto ${
                isEmAltaActive ? 'text-purple-500' : 'text-white'
              }`}
              onClick={() => {
                navigate(`/tendencias`);
                setIsMenuOpen(false);
              }}
            >
              Em Alta
            </Button>
            <Button
              variant="link"
              className={`text-lg font-semibold p-0 h-auto ${
                isSobreActive ? 'text-purple-500' : 'text-white'
              }`}
              onClick={() => {
                navigate(`/sobre`);
                setIsMenuOpen(false);
              }}
            >
              Sobre
            </Button>
          </section>

          {/* Chamada para contribuição open source em dispositivos móveis */}
          <section className="w-full flex items-center gap-3">
            <a
              href="https://x.com/PautaCidada"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white text-md font-semibold hover:underline"
            >
              Participe da discussão
            </a>
            <a
              href="https://x.com/PautaCidada"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <img
                src={TwitterLogo}
                className="w-[30px] hover:opacity-80 transition-opacity"
                alt="X / Twitter"
              />
            </a>
            <a
              href="https://github.com/Pauta-Cidada"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <img
                src={Github}
                className="w-[30px] hover:opacity-80 transition-opacity"
                alt="Github"
              />
            </a>
          </section>
        </div>
      )}
    </>
  );
}
