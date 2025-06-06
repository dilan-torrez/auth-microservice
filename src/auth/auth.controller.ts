import { Controller, Logger, UseGuards } from '@nestjs/common';
import { LdapAuthGuard } from './ldap-auth.guard';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger('AuthController');
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LdapAuthGuard)
  @MessagePattern('auth.login')
  async login(@Payload() data: any) {
    const jwt = await this.authService.generateJwt(data.user);
    return {
      access_token: jwt,
      user: {
        username: data.user.uid,
        name: data.user.cn,
      },
    };
  }

  @MessagePattern('auth.verify.token')
  async verifyToken(@Payload() token: string) {
    this.logger.debug('verify token');
    const username = await this.authService.verifyToken(token);
    return {
      username,
    };
  }

  @MessagePattern('auth.verify.apikey')
  async verifyApiKey(@Payload() apikey: string) {
    this.logger.debug('verify apikey');
    return await this.authService.verifyApiKey(apikey);
  }
}
