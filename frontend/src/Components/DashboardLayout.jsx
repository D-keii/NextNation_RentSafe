import { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Building2, FileText, Heart, Wallet, ClipboardList, LogOut, Menu, User } from 'lucide-react';
import Logo from './Logo.jsx';
import { Button } from './ui/button.jsx';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from './ui/dropdown-menu.jsx';
import { UserContext } from '../Context/UserContext.jsx'

// Simple dashboard shell inspired by the TS version, tailored for current JS setup
export function DashboardLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Mocked user (replace with real auth when available)
  const {userProfile} =   useContext(UserContext)

  const tenantLinks = [
    { href: '/tenant-dashboard', label: 'Dashboard', icon: Home },
    { href: '/saved', label: 'Saved Listings', icon: Heart },
    { href: '/applications', label: 'Applications', icon: ClipboardList },
    { href: '/contracts', label: 'Contracts', icon: FileText },
    { href: '//tenant-escrow', label: 'Escrow', icon: Wallet },
  ];

  const landlordLinks = [
    { href: '/landlord-dashboard', label: 'Dashboard', icon: Home },
    { href: '/properties', label: 'My Properties', icon: Building2 },
    { href: '/applications/list', label: 'Applications', icon: ClipboardList },
    { href: '/contracts', label: 'Contracts', icon: FileText },
    // { href: '/escrow', label: 'Escrow', icon: Wallet },
  ];

  const links = userProfile?.role === 'landlord' ? landlordLinks : tenantLinks;

  const handleLogout = () => {
    // Placeholder: replace with real logout
    navigate('/');
  };


  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-card/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to={userProfile.role ==="landlord" ? "/landlord-dashboard" : "/tenant-dashboard"} className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Logo size="sm" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              {({ open, setOpen }) => (
                <>
                  <DropdownMenuTrigger asChild open={open} setOpen={setOpen}>
                    <Button variant="ghost" className="gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-foreground">
                          {userProfile?.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <span className="hidden sm:inline">{userProfile?.name || 'User'}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent open={open} align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span>{userProfile?.name || 'User'}</span>
                        <span className="text-xs text-muted-foreground capitalize">{userProfile?.role || 'tenant'}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => { setOpen(false); navigate('/profile'); }}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => { setOpen(false); handleLogout(); }} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </>
              )}
            </DropdownMenu>

            {/* Mobile Menu */}
            <DropdownMenu>
              {({ open, setOpen }) => (
                <>
                  <DropdownMenuTrigger asChild open={open} setOpen={setOpen} className="md:hidden">
                    <Button variant="ghost" size="icon">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent open={open} align="end" className="w-56">
                    {links.map((link) => {
                      const Icon = link.icon;
                      return (
                        <DropdownMenuItem key={link.href} onClick={() => { setOpen(false); navigate(link.href); }}>
                          <Icon className="mr-2 h-4 w-4" />
                          {link.label}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </>
              )}
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-5">{children}</main>
    </div>
  );
}

export default DashboardLayout;

