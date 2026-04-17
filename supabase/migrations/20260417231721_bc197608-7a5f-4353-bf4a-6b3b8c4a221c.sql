INSERT INTO public.user_roles (user_id, role)
VALUES ('d91a474b-839f-4887-a1a6-63fac6f2366a', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;