import { Controller, Get, Post, Put, Delete, Inject, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { response } from 'express';
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



  // =======================================================
  //                 DOCUMENTOS ENDPOINTS (Mongo)
  // =======================================================

  // documentos endpoints
  @Post('documents/save-one')
  saveDocOne(@Body() body: { id_unico: string, slot: 'dpi'|'foto_dpi'|'penal'|'policial', url: string }) {
    return this.DatosClient.send({ cmd: 'docs.save.one' }, body)
  }

  @Post('documents/save-many')
  saveDocMany(@Body() body: { id_unico: string, items: { slot: 'dpi'|'foto_dpi'|'penal'|'policial', url: string }[] }) {
    return this.DatosClient.send({ cmd: 'docs.save.many' }, body)
  }

  @Get('documents/:id_unico')
  getDocs(@Param('id_unico') id_unico: string) {
    return this.DatosClient.send({ cmd: 'docs.get.all' }, { id_unico })
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
      const { correo_electronico } = body;

      // 1️⃣ Revisar si el correo ya existe en la base de datos
      const existingUser = await firstValueFrom(
        this.Loginclient.send({ cmd: 'check_email' }, { correo_electronico })
      );

      if (existingUser.status === 'error') throw new HttpException(existingUser.message, existingUser.code || HttpStatus.INTERNAL_SERVER_ERROR);
      if (existingUser.data?.exists) {
        return { status: 'error', message: 'El correo ya está registrado, por favor usa otro' };
      }
      // 2️⃣ Guardar datos temporales en memoria
      this.tempUsers.set(correo_electronico, body);

      // 3️⃣ Enviar OTP
      const result = await firstValueFrom(
        this.AuthClient.send({ cmd: 'send_otp' }, { channel: 'email', target: correo_electronico })
      );

      if (result.status === 'error') {
      throw new HttpException(result.message, result.code || HttpStatus.BAD_REQUEST);
      }

      return {
        status: 'success',
        message: 'OTP enviado correctamente',
        correo: correo_electronico,
      };
    } catch (error) {
      const status = error.getStatus?.() || error.code || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message || 'Error interno al iniciar registro';
      throw new HttpException(message, status);
    }
  }


  // 🟩 CONFIRMAR REGISTRO

  @Post('register/confirm')
  async registerConfirm(@Body() body: { correo_electronico: string; code: string }) {
    try {
      // 1️⃣ Verificar OTP
      const otpResponse = await firstValueFrom(
        this.AuthClient.send({ cmd: 'verify_otp' }, { code: body.code , correo_electronico: body.correo_electronico }),
      );

      if (otpResponse.status === 'error') {
        return {
          status: 'error',
          code: otpResponse.code || HttpStatus.BAD_REQUEST,
          message: otpResponse.message,
        };
      }

      // ✅ Respuesta individual del OTP (solo confirmación)
      const otpResult = {
        status: 'success',
        code: HttpStatus.OK,
        message: 'OTP verificado correctamente',
      };

      // 2️⃣ Recuperar datos temporales
      const userData = this.tempUsers.get(body.correo_electronico);
      if (!userData) {
        return {
          status: 'error',
          code: HttpStatus.NOT_FOUND,
          message: 'Datos de registro no encontrados o expirados',
        };
     }

     //Para revisión de envio de datos del temporal al User_SERVICE_SQL
     //console.log('🧩 userData recuperado de tempUsers:', userData); 
      // 3️⃣ Crear usuario
      const createdUser = await firstValueFrom(
        this.Loginclient.send({ cmd: 'create_user' }, userData),
      );

      // 4️⃣ Eliminar datos temporales
      this.tempUsers.delete(body.correo_electronico);

      // ✅ Respuesta final del usuario
      return {
        otp: otpResult,
        userCreation: {
          status: createdUser.status || 'success',
          code: createdUser.code || HttpStatus.CREATED,
          message: createdUser.message || 'Usuario creado exitosamente',
          data: createdUser.data || createdUser,
        },
      };

    } catch (error) {
      const status =
        error.getStatus?.() || error.code || HttpStatus.INTERNAL_SERVER_ERROR;

      throw new HttpException(
        {
          status: 'error',
          code: status,
          message: error.message || 'Error interno al confirmar registro',
        },
        status,
      );
    }
  }



  // =======================================================
  //                 EMPRESAS Y EMPLEOS (SQL)
  // =======================================================

  // Crear compañía (solo SQL)
  @Post('enterprise/companyUser')
  async createEnterpriseCompany(@Body() body: any) {
    try {
      const sqlCompany = await firstValueFrom(
        this.JobsSQLClient.send({ cmd: 'create_company' }, body)
      );

      if (sqlCompany.status === 'error') {
      throw new HttpException(sqlCompany.message, sqlCompany.code);
      }
    
      return sqlCompany
    } catch (error) { 
      const status = error.getStatus ? error.getStatus() : error.code || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message;
      throw new HttpException(message, status);
    }
  }

  // Crear empleo (solo SQL)
  @Post('enterprise/jobs')
  async createEnterpriseJob(@Body() body: any) {

    try{
      const sqlJob = await firstValueFrom(
        this.JobsSQLClient.send({ cmd: 'create_enterprise_job' }, body)
      );

      if (sqlJob.status === 'error') {
      throw new HttpException(sqlJob.message, sqlJob.code);
      }
      return sqlJob;
    } catch (error) { 
      const status = error.getStatus ? error.getStatus() : error.code || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message;
      throw new HttpException(message, status);
    }
  }

  
// actualizar detalle de empleo (Mongo)
  @Put('enterprise/job-details/:uuid')
  async updateJobDetail(@Param('uuid') uuid: string, @Body() body: any) {
    try {
      const updatedDetail = await firstValueFrom(
        this.JobsMongoClient.send({ cmd: 'update_job_detail' }, { uuid, updateData: body })
      );
      if (updatedDetail.status === 'error') {
        throw new HttpException(updatedDetail.message, updatedDetail.code);
      }

      return updatedDetail;
    } catch (error) { 
      const status = error.getStatus ? error.getStatus() : error.code || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message;
      throw new HttpException(message, status);
    }
  }

}
