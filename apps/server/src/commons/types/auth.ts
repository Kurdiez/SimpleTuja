import { UserEntity } from '~/database/entities/user.entity';

export interface AuthenticatedRequest extends Request {
  user: UserEntity;
}
