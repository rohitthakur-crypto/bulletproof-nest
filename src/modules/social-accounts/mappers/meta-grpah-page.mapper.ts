import { MetaPageResponse } from '../dto';
import { MetaGraphPage } from '../interfaces';

export const mapMetaGraphPageToMetaPage = (page: MetaGraphPage): MetaPageResponse => ({
  id: page.id,
  name: page.name || '',
  picture: page.picture?.data.url || '',
});
