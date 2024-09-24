import './module-alias'
import { join } from 'path';
import AutoLoad, {AutoloadPluginOptions} from '@fastify/autoload';
import {FastifyPluginAsync, FastifyReply, FastifyRequest, FastifyServerOptions} from 'fastify';
import {sequelize} from "./config/dbconfig";



export interface AppOptions extends FastifyServerOptions, Partial<AutoloadPluginOptions> {

}
// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {
}

const app: FastifyPluginAsync<AppOptions> = async (
    fastify,
    opts
): Promise<void> => {
  await sequelize

  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: opts
  })

  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    options: opts,
    dirNameRoutePrefix: false
  })

};

export default app;
export { app, options }
