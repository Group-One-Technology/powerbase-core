import { Logtail } from '@logtail/browser';

const { LOGTAIL_SOURCE_TOKEN } = process.env;
export const logger = new Logtail(LOGTAIL_SOURCE_TOKEN);
