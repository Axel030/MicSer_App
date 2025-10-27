import { Controller, Get, Post, Put, Delete, Inject, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateUserDto } from '../dto/create-user.dto';
import { ConfirmRegisterDto } from '../dto/confirm-register.dto';
import { ApplyJobDto } from '../dto/apply-job.dto';


@Controller()
export class AppController {
  private tempUsers = new Map<string, any>();
  
  constructor(
    @Inject('USER_SERVICE_SQL') private readonly Loginclient: ClientProxy,
    @Inject('USER_SERVICE_MONGO') private readonly DatosClient: ClientProxy,
    @Inject('AUTH_SERVICE') private readonly AuthClient: ClientProxy,
    @Inject('ENTERPRISE_JOBS_SQL') private readonly JobsSQLClient: ClientProxy,
    @Inject('ENTERPRISE_JOBS_MONGO') private readonly JobsMongoClient: ClientProxy,
    @Inject('JOB_APPLICATION_SQL') private readonly JobAppSQLClient: ClientProxy,
    @Inject('JOB_APPLICATION_MONGO') private readonly JobAppMongoClient: ClientProxy,
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
  async createUser(@Body() body: CreateUserDto) {
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
    if (response.status === 'error') 
      throw new HttpException(response.message, response.code);
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
  async registerInit(@Body() body: CreateUserDto) {
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
  async registerConfirm(@Body() body: ConfirmRegisterDto) {
    try {
      // 1️⃣ Verificar OTP
      const otpResponse = await firstValueFrom(
        this.AuthClient.send(
          { cmd: 'verify_otp' },
          { code: body.code, correo_electronico: body.correo_electronico },
        ),
      );

      // ⚠️ Si el OTP es incorrecto, expirado o se excedieron los intentos
      if (otpResponse.status === 'error') {
        throw new HttpException(
          {
            status: 'error',
            code: otpResponse.code || HttpStatus.BAD_REQUEST,
            message: otpResponse.message,
          },
          otpResponse.code || HttpStatus.BAD_REQUEST,
        );
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
        throw new HttpException(
          {
            status: 'error',
            code: HttpStatus.NOT_FOUND,
            message: 'Datos de registro no encontrados o expirados',
          },
         HttpStatus.NOT_FOUND,
        );
      }

      // 3️⃣ Crear usuario
      const createdUser = await firstValueFrom(
        this.Loginclient.send({ cmd: 'create_user' }, userData),
      );

      // 4️⃣ Eliminar datos temporales
      this.tempUsers.delete(body.correo_electronico);

      // ✅ Respuesta final correcta
      return {
        status: 'success',
        code: HttpStatus.CREATED,
        message: 'Usuario creado exitosamente',
        data: {
          otp: otpResult,
          user: createdUser.data || createdUser,
        },
      };
    } catch (error) {
      const status =
        error.getStatus?.() || error.code || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message || 'Error interno al confirmar registro';

      throw new HttpException(
        {
          status: 'error',
          code: status,
          message,
        },
        status,
      );
    }
  }




  // =======================================================
  //                 EMPRESAS Y EMPLEOS (SQL)
  // =======================================================

  // Obtener trabajo con detalles y compañía (SQL + Mongo)

  @Get('enterprise/job/:job_unique_id')
  async getEnterpriseJob(@Param('job_unique_id') job_unique_id: string) {
    try {
      const sqlJob = await firstValueFrom(
        this.JobsSQLClient.send({ cmd: 'get_enterprise_job' }, { job_unique_id })
      );
      if (sqlJob.status === 'error') 
      throw new HttpException(sqlJob.message, sqlJob.code);
      return sqlJob;
    } catch (error) { 
      const status = error.getStatus ? error.getStatus() : error.code || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message;
      throw new HttpException(message, status);
    }
    
  }

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

  //obtener empleo y compañia (SQL + Mongo) activos(published)
  @Get('enterprise/jobs/active')
  async getAllActiveJobs() {
    try {
      const response = await firstValueFrom(
        this.JobsSQLClient.send({ cmd: 'get_all_active_jobs' }, {})
      );

      if (response.status === 'error') {
        throw new HttpException(response.message, response.code);
      }

      return response;
    } catch (error) {
      const status = error.getStatus ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException(error.message, status);
    }
  }

  //obtener empleo y compañia (SQL + Mongo) activos(published) - vista previa (solo campos esenciales)

  @Get('enterprise/jobs/preview')
async getJobsPreview() {
  try {
    const response = await firstValueFrom(
      this.JobsSQLClient.send({ cmd: 'get_jobs_preview' }, {})
    );

    return response;
  } catch (error) {
    throw new HttpException('Error al obtener vista previa de empleos', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}



  // =======================================================
  //              APLICACIONES DE EMPLEO (SQL + Mongo)
  // =======================================================

  @Post('job-applications')
  async applyToJob(@Body() body: ApplyJobDto) {
    try {


      const payload = {
        job_uuid: (body as any).job_uuid ?? (body as any).job_unique_id,
        user_unique_id: (body as any).user_unique_id ?? (body as any).user_uniqueId,
        message: (body as any).message,
      };

      console.log('📨 Enviando a job-application-sql:', payload);
      // 1️⃣ Guardar en SQL (registro formal de aplicación)
      const sqlResponse = await firstValueFrom(
        
        this.JobAppSQLClient.send({ cmd: 'apply_to_job' }, payload),
        
      );

      if (sqlResponse.status === 'error') {
        throw new HttpException(sqlResponse.message, sqlResponse.code);
      }

      // 2️⃣ Guardar también en Mongo (para historial o auditoría)
      const mongoResponse = await firstValueFrom(
        this.JobAppMongoClient.send({ cmd: 'create_job_log' }, {
          application_id: sqlResponse.data.id,
          user_unique_id: sqlResponse.data.user_unique_id,
          job_uuid: sqlResponse.data.job_uuid,
          event: 'applied',
          message: sqlResponse.data.message ?? 'Usuario aplicó al empleo',
        }),
      );
      return {
        status: 'success',
        message: 'Aplicación registrada exitosamente',
        data: {
          sql: sqlResponse.data,
          mongo: mongoResponse.data,
        },
      };
    } catch (error) {
      const status =
        error.getStatus?.() || error.code || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message || 'Error al aplicar al empleo';
      throw new HttpException(message, status);
    }
  }

  // 🔍 Obtener todas las aplicaciones de un usuario
  @Get('job-applications/user/:uniqueId')
  async getApplicationsByUser(@Param('uniqueId') uniqueId: string) {
    try {
      const response = await firstValueFrom(
        this.JobsSQLClient.send({ cmd: 'get_user_applications' }, { uniqueId }),
      );

      if (response.status === 'error') {
        throw new HttpException(response.message, response.code);
      }

      return response;
    } catch (error) {
      const status =
        error.getStatus?.() || error.code || HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException(error.message, status);
    }
  }

  // 🔍 Obtener todas las aplicaciones de un empleo
  @Get('job-applications/job/:jobUniqueId')
  async getApplicationsByJob(@Param('jobUniqueId') jobUniqueId: string) {
    try {
      const response = await firstValueFrom(
        this.JobsSQLClient.send({ cmd: 'get_job_applications' }, { jobUniqueId }),
      );

      if (response.status === 'error') {
        throw new HttpException(response.message, response.code);
      }

      return response;
    } catch (error) {
      const status =
        error.getStatus?.() || error.code || HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException(error.message, status);
    }
  }

  // 🟢 Aceptar empleado para un trabajo
  @Post('job-applications/accept')
  async acceptEmployee(@Body() body: { job_unique_id: string; user_unique_id: string }) {
    try {
      const response = await firstValueFrom(
        this.JobsSQLClient.send({ cmd: 'accept_employee' }, body),
      );

      if (response.status === 'error') {
        throw new HttpException(response.message, response.code);
      }

      // Notificar a Mongo también
      await firstValueFrom(
        this.JobsMongoClient.send({ cmd: 'notify_job_acceptance' }, response.data),
      );

      return {
        status: 'success',
        message: 'Empleado aceptado correctamente para el trabajo',
        data: response.data,
      };
    } catch (error) {
      const status =
      error.getStatus?.() || error.code || HttpStatus.INTERNAL_SERVER_ERROR;
    throw new HttpException(error.message, status);
    }
  }

    // 🏁 Completar trabajo
  @Post('job-applications/complete')
  async completeJob(@Body() body: { id: number; feedback?: string }) {
    try {
      // 1️⃣ Ejecutar en SQL
      const sqlResponse = await firstValueFrom(
        this.JobsSQLClient.send({ cmd: 'complete_job' }, body),
      );

      if (sqlResponse.status === 'error') {
        throw new HttpException(sqlResponse.message, sqlResponse.code);
      }

    // 2️⃣ Registrar evento en Mongo
      await firstValueFrom(
        this.JobsMongoClient.send({ cmd: 'create_job_log' }, {
          application_id: sqlResponse.data.id,
          user_unique_id: sqlResponse.data.user_unique_id,
          job_uuid: sqlResponse.data.job_uuid,
          event: 'completed',
          message: body.feedback || 'Trabajo marcado como completado',
        }),
      );

      return {
        status: 'success',
        message: 'Trabajo completado exitosamente',
        data: sqlResponse.data,
      };
    } catch (error) {
      const status =
        error.getStatus?.() || error.code || HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException(error.message, status);
    }
  }
}
