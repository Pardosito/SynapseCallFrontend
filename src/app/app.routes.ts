import { Routes } from '@angular/router';
import { Landing } from './pages/landing/landing';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { MeetingRoom } from './pages/meeting-room/meeting-room';
import { Dashboard } from './pages/dashboard/dashboard';

export const routes: Routes = [
	{ path: '', component: Landing },
	{ path: 'login', component: Login },
	{ path: 'register', component: Register },
	{ path: "dashboard", component: Dashboard },
	{ path: "room/:id", component: MeetingRoom }
];
