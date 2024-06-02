import express from 'express';
import { router } from '../router/router.js';

export const httpServer = new express();
export const serviceInit = () => {
    httpServer.use(express.json());
    httpServer.use(express.urlencoded({ extended: true }));
    httpServer.use(router)
}