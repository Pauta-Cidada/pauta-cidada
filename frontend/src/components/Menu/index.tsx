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
      <nav className="bg-gray-900 z-50 flex items-center md:gap-4 py-3 px-6 md:px-24 sticky top-0 border-b border-gray-700">
        <div>
          <img src={Logo} className="w-[110px]" />
        </div>

        <section
          className={'ml-12 invisible md:visible w-full flex justify-between'}
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
              className="text-gray-700"
            />
          )}

          {isMenuOpen && (
            <XCircle
              width={25}
              height={25}
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="text-gray-700"
            />
          )}
        </section>
      </nav>

      {/* Exibição temporária do menu para telas mobiles - Precisa finalizar o estilo */}
      {isMenuOpen && (
        <div className="md:hidden border-b border-gray-200">
          <section className="w-full flex flex-col items-start gap-y-2">
            <Button
              variant="link"
              className={'text-gray-700 text-sm font-semibold'}
              onClick={() => navigate('/empresas')}
            >
              Empresas
            </Button>
          </section>
          <section className="w-full flex justify-end  p-4 items-center text-white">
            User
            {/* <UserDropdown /> */}
          </section>
        </div>
      )}
    </>
  );
}
