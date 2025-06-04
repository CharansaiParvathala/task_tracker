import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/language-context';
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Eye, EyeOff, LogIn } from 'lucide-react';

export default function Login() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      toast({
        title: 'Success',
        description: 'Login successful! Redirecting...',
      });
      
      // Get the current user from storage to determine their role
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
      if (currentUser) {
        // Navigate based on role
        switch (currentUser.role) {
          case 'leader':
            navigate('/leader/dashboard');
            break;
          case 'checker':
            navigate('/checker/dashboard');
            break;
          case 'owner':
            navigate('/owner/dashboard');
            break;
          case 'admin':
            navigate('/admin/dashboard');
            break;
          default:
            navigate('/');
        }
      } else {
        navigate('/');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Login failed',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-primary/10 to-secondary/5 dark:from-primary/5 dark:to-background">
      <Card className="w-full max-w-md border-2 border-primary/10 dark:border-primary/20 shadow-lg">
        <CardHeader className="space-y-2 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary flex items-center justify-center bg-white dark:bg-background">
            <img
              src="/lovable-uploads/a723c9c5-8174-41c6-b9d7-2d8646801ec6.png"
              alt="Sai Balaji Construction"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/lovable-uploads/dec9f020-a443-46b8-9996-45dedd958103.png";
              }}
            />
          </div>
          <span className="font-bold text-lg text-center mt-2 text-primary dark:text-primary-light">
            Sai Balaji Construction
          </span>
          <CardTitle className="text-2xl text-center mt-1">
            {t("app.auth.welcomeBack")}
          </CardTitle>
          <CardDescription className="text-center">
            {t("app.auth.enterCredentials")}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">{t("app.auth.email")}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={t("app.auth.emailPlaceholder")}
                value={formData.email}
                onChange={handleChange}
                required
                className="bg-background dark:bg-background border-2"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">{t("app.auth.password")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("app.auth.passwordPlaceholder")}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="bg-background dark:bg-background border-2 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("common.loading") : (
                <span className="flex items-center gap-2">
                  <LogIn size={18} />
                  {t("app.auth.login")}
                </span>
              )}
            </Button>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              {t("app.auth.forgotPassword")}{' '}
              <Link to="/forgot-password" className="text-primary hover:underline">
                {t("app.auth.resetPassword")}
              </Link>
            </div>
            <div className="text-sm text-center text-muted-foreground">
              {t("app.auth.dontHaveAccount")}{' '}
              <Link to="/signup" className="text-primary hover:underline">
                {t("app.auth.signup")}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
