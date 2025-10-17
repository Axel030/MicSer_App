import { Controller, Get, Post, Put, Delete, Inject, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller()
export class AppController {
  private tempUsers = new Map<string, any>();
  
  constructor(
    @Inject('USER_SERVICE_SQL') private readonly Loginclient: ClientProxy,
    @Inject('USER_SERVICE_MONGO') private readonly DatosClient: ClientProxy,
    @Inject('AUTH_SERVICE') private readonly AuthClient: ClientProxy,
    @Inject('ENTERPRISE_JOBS_SQL') private readonly JobsSQLClient: ClientProxy,
    @Inject('ENTERPRISE_JOBS_MONGO') private readonly JobsMongoClient: ClientProxy,
  ) {}

 // =========================
  //       LOGIN
  // =========================
  @Post('login')
  async login(@Body() body: { correo_electronico: string; contrasena: string }) {
    try {
      const response = await firstValueFrom(
        this.Loginclient.send({ cmd: 'login' }, body)
      );

      // ✅ Propagar el código HTTP correcto
      if (response.status === 'success') {
        return {
          statusCode: response.code,
          status: response.status,
          message: response.message,
          data: response.data,
        };
      } else {
        throw new HttpException(response.message, response.code);
      }
    } catch (error) {
      const status = error.getStatus ? error.getStatus() : error.code || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message;
      throw new HttpException(message, status);

    }
  }


  // =========================
  //       USUARIOS (SQL)
  // =========================

 @Post('users')
  async createUser(@Body() body: any) {
    try {
    const response = await firstValueFrom(this.Loginclient.send({ cmd: 'create_user' }, body));
    if (response.status === 'error') throw new HttpException(response.message, response.code);
    return response;
    }
    catch (error) { 
      const status = error.getStatus ? error.getStatus() : error.code || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message;
      throw new HttpException(message, status);

    }
  }

  @Put('users/:id')
  async updateUser(@Param('id') id: number, @Body() body: any) {
    try {
    const response = await firstValueFrom(this.Loginclient.send({ cmd: 'update_user' }, { id, ...body }));
    if (response.status === 'error') throw new HttpException(response.message, response.code);
    return response;
    }
    catch (error) { 
      const status = error.getStatus ? error.getStatus() : error.code || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message;
      throw new HttpException(message, status);

    }
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: number) {
    try {
    const response = await firstValueFrom(this.Loginclient.send({ cmd: 'delete_user' }, { id }));
    if (response.status === 'error') throw new HttpException(response.message, response.code);
    return response;
    }
    catch (error) { 
      const status = error.getStatus ? error.getStatus() : error.code || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message;
      throw new HttpException(message, status);

    }
  }

  @Get('users/:id/with-profile')
  async getUserWithProfile(@Param('id') id: string) {
    try {
    const response = await firstValueFrom(this.Loginclient.send({ cmd: 'get_user_with_profile' }, { id: Number(id) }));
    if (response.status === 'error') throw new HttpException(response.message, response.code);
    return response;
    }
    catch (error) { 
      const status = error.getStatus ? error.getStatus() : error.code || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message;
      throw new HttpException(message, status);

    }
  }



  // =========================
  //       PERFILES (Mongo)
  // =========================

  // Obtener perfil por id_unico
  @Get('profiles/:id_unico')
  async getProfileByIdUnico(@Param('id_unico') id_unico: string) {
    try {
      const response = await firstValueFrom(
        this.DatosClient.send({ cmd: 'get_profile_by_id_unico' }, { id_unico }),
      );

      if (response.status === 'error') {
        throw new HttpException(response.message, response.code);
      }

    return response;
    } catch (error) {
      const status = error.getStatus ? error.getStatus() : error.code || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message;
      throw new HttpException(message, status);

    }
  }

  // Actualizar perfil por id
  @Put('profiles/:id')
  async updateProfile(@Param('id') id: string, @Body() body: any) {
    try {
      const response = await firstValueFrom(
        this.DatosClient.send({ cmd: 'update_profile' }, { id, ...body }),
      );

      if (response.status === 'error') {
        throw new HttpException(response.message, response.code);
     }

      return response;
    } catch (error) {
      const status = error.getStatus ? error.getStatus() : error.code || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message;
      throw new HttpException(message, status);

    }
  }

  // Actualizar perfil por id_unico
  @Put('profiles/unique/:id_unico')
  async updateProfileByUniqueId(@Param('id_unico') id_unico: string, @Body() body: any) {
    try {
      const response = await firstValueFrom(
        this.DatosClient.send({ cmd: 'update_profile_by_unique_id' }, { id_unico, ...body }),
      );

      if (response.status === 'error') {
        throw new HttpException(response.message, response.code);
      }

      return response;
    } catch (error) {
      const status = error.getStatus ? error.getStatus() : error.code || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message;
      throw new HttpException(message, status);

    }
  }

  // Eliminar perfil por id
  @Delete('profiles/:id')
  async deleteProfile(@Param('id') id: string) {
    try {
      const response = await firstValueFrom(
        this.DatosClient.send({ cmd: 'delete_profile' }, { id }),
      );

      if (response.status === 'error') {
        throw new HttpException(response.message, response.code);
      }

      return response;
    } catch (error) {
      const status = error.getStatus ? error.getStatus() : error.code || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message;
      throw new HttpException(message, status);

    }
  }

  // Eliminar perfil por id_unico (💡 adicional si lo usas)
  @Delete('profiles/unique/:id_unico')
  async deleteProfileByUniqueId(@Param('id_unico') id_unico: string) {
    try {
      const response = await firstValueFrom(
        this.DatosClient.send({ cmd: 'delete_profile_by_unique_id' }, { id_unico }),
      );

      if (response.status === 'error') {
        throw new HttpException(response.message, response.code);
      }

      return response;
    } catch (error) {
      const status = error.getStatus ? error.getStatus() : error.code || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message;
      throw new HttpException(message, status);

    }
  }




  
  // =================================
  //            AUTENTICACIÓN
  // =================================


  // 🟨 REENVIO DE OTP

  @Post('register/resend-otp')
  async resendOtp(@Body() body: { correo_electronico: string }) {
    try {
      const userData = this.tempUsers.get(body.correo_electronico);
      if (!userData) {
        throw new HttpException('Datos de registro no encontrados', HttpStatus.BAD_REQUEST);
      }

      const result = await firstValueFrom(
        this.AuthClient.send({ cmd: 'send_otp' }, { channel: 'email', target: body.correo_electronico })
      );

      return result;
    } catch (error) {
      const status = error.getStatus ? error.getStatus() : error.code || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message;
      throw new HttpException(message, status);
    }
  }


  // 🟦 INICIO DE REGISTRO

  @Post('register/init')
  async registerInit(@Body() body: any) {
    try {
      // 1️⃣ Guardar datos temporales en memoria
      const tempId = body.correo_electronico;
      this.tempUsers.set(tempId, body);

      // 2️⃣ Enviar OTP al correo
      const result = await firstValueFrom(
        this.AuthClient.send(
          { cmd: 'send_otp' },
          { channel: 'email', target: body.correo_electronico },
        ),
      );

      // Validar respuesta del microservicio
      if (result.status === 'error') {
        throw new HttpException(result.message, result.code || HttpStatus.BAD_REQUEST);
      }

      return {
        status: 'success',
        message: 'OTP enviado correctamente',
        correo: body.correo_electronico,
      };
    } catch (error) {
      const status =
        error.getStatus?.() ||
        error.code ||
        HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message || 'Error interno al iniciar registro';
      throw new HttpException(message, status);
    }
  }

  // 🟩 CONFIRMAR REGISTRO

  @Post('register/confirm')
  async registerConfirm(
    @Body() body: { correo_electronico: string; code: string },
  ) {
    try {
      // 1️⃣ Verificar OTP
      const otpResponse = await firstValueFrom(
        this.AuthClient.send({ cmd: 'verify_otp' }, { code: body.code }),
      );

      if (otpResponse.status === 'error') {
        throw new HttpException(
          otpResponse.message,
          otpResponse.code || HttpStatus.BAD_REQUEST,
        );
      }

      // 2️⃣ Recuperar datos temporales
      const userData = this.tempUsers.get(body.correo_electronico);
      if (!userData) {
        throw new HttpException(
          'Datos de registro no encontrados o expirados',
          HttpStatus.NOT_FOUND,
        );
      }

      // 3️⃣ Crear usuario en user_service_sql
      const createdUser = await firstValueFrom(
        this.Loginclient.send({ cmd: 'create_user' }, userData),
      );

      // 4️⃣ Eliminar datos temporales
      this.tempUsers.delete(body.correo_electronico);

      // 5️⃣ Responder
      return createdUser;
    } catch (error) {
      const status =
        error.getStatus?.() ||
        error.code ||
        HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message || 'Error interno al confirmar registro';
      throw new HttpException(message, status);
    }
  }


  // =======================================================
  //                 EMPRESAS Y EMPLEOS (SQL)
  // =======================================================

  // Crear compañía (solo SQL)
  @Post('enterprise/companyUser')
  async createEnterpriseCompany(@Body() body: any) {
    const sqlCompany = await firstValueFrom(
      this.JobsSQLClient.send({ cmd: 'create_company' }, body)
    );

    // ⚠️ Ya NO se envía nada a Mongo aquí.
    // El evento 'enterprise_company_created' lo manejará automáticamente el servicio Mongo.

    return { ...sqlCompany, message: 'Compañía creada correctamente' };
  }

  // Crear empleo (solo SQL)
  @Post('enterprise/jobs')
  async createEnterpriseJob(@Body() body: any) {
    const sqlJob = await firstValueFrom(
      this.JobsSQLClient.send({ cmd: 'create_enterprise_job' }, body)
    );

    // ⚠️ Ya NO se manda manualmente a Mongo.
    // El evento 'enterprise_job_created' será escuchado por el microservicio Mongo.

    return { ...sqlJob, message: 'Empleo creado correctamente' };
  }

  
// actualizar detalle de empleo (Mongo)
  @Put('enterprise/job-details/:uuid')
  async updateJobDetail(@Param('uuid') uuid: string, @Body() body: any) {
    const updatedDetail = await firstValueFrom(
      this.JobsMongoClient.send({ cmd: 'update_job_detail' }, { uuid, updateData: body })
    );
    return updatedDetail;
  }

}

