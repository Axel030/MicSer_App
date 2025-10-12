import { Controller, Get, Post, Put, Delete, Inject, Body, Param } from '@nestjs/common';
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
  //       USUARIOS (SQL)
  // =========================

  // Login
  @Post('login')
  login(@Body() body: { correo_electronico: string; contrasena: string }) {
    return this.Loginclient.send({ cmd: 'login' }, body);
  }

  // Obtener usuario con su perfil (SQL + Mongo)
  @Get('users/:id/with-profile')
  getUserWithProfile(@Param('id') id: string) {
    return this.Loginclient.send({ cmd: 'get_user_with_profile' }, { id: Number(id) });
  }

  // Crear un nuevo usuario
  @Post('users')
  createUser(@Body() body: any) {
    return this.Loginclient.send({ cmd: 'create_user' }, body);
  }

  // Actualizar usuario
  @Put('users/:id')
  updateUser(@Param('id') id: number, @Body() body: any) {
    return this.Loginclient.send({ cmd: 'update_user' }, { id, ...body });
  }

  // Eliminar usuario
  @Delete('users/:id')
  deleteUser(@Param('id') id: number) {
    return this.Loginclient.send({ cmd: 'delete_user' }, { id });
  }

  // =========================
  //       PERFILES (Mongo)
  // =========================

  // Obtener perfil por id_unico
  @Get('profiles/:id_unico')
  getProfileByIdUnico(@Param('id_unico') id_unico: string) {
    return this.DatosClient.send({ cmd: 'get_profile_by_id_unico' }, { id_unico });
  }

  // Actualizar perfil por id
  @Put('profiles/:id')
  updateProfile(@Param('id') id: string, @Body() body: any) {
    return this.DatosClient.send({ cmd: 'update_profile' }, { id, ...body });
  }

  // Actualizar perfil por id_unico
  @Put('profiles/unique/:id_unico')
  async updateProfileByUniqueId(@Param('id_unico') id_unico: string, @Body() body: any) {
    const response = await firstValueFrom(
      this.DatosClient.send({ cmd: 'update_profile_by_unique_id' }, { id_unico, ...body })
    );
    return response;
  }

  // Eliminar perfil
  @Delete('profiles/:id')
  deleteProfile(@Param('id') id: string) {
    return this.DatosClient.send({ cmd: 'delete_profile' }, { id });
  }



  
   // =========================
  //       AUTENTICACIÓN
  // =========================

  // api_gateway_service/app.controller.ts
  @Post('register/init')
  async registerInit(@Body() body: any) {
    // 1️⃣ Guardar los datos temporales en memoria o base temporal (Map, Redis, etc.)
    // ejemplo en memoria:
    const tempId = body.correo_electronico; // key simple
    this.tempUsers.set(tempId, body);

    // 2️⃣ Enviar OTP al correo
    const result = await firstValueFrom(
      this.AuthClient.send({ cmd: 'send_otp' }, { channel: 'email', target: body.correo_electronico })
    );

    return { message: 'OTP enviado', correo: body.correo_electronico };
  }

  @Post('register/confirm')
  async registerConfirm(@Body() body: { correo_electronico: string; code: string }) {
    // 1️⃣ Verificar OTP
    const isValid = await firstValueFrom(
      this.AuthClient.send({ cmd: 'verify_otp' }, { code: body.code })
    );

    if (!isValid.valid) {
      return { status: 'error', message: 'OTP inválido o expirado' };
    }

    // 2️⃣ Recuperar datos temporales
    const userData = this.tempUsers.get(body.correo_electronico);
    if (!userData) return { status: 'error', message: 'Datos de registro no encontrados' };

    // 3️⃣ Enviar evento a user_service_sql para crear usuario
    const createdUser = await firstValueFrom(
      this.Loginclient.send({ cmd: 'create_user' }, userData)
    );

    // 4️⃣ Limpiar memoria temporal
    this.tempUsers.delete(body.correo_electronico);

    return createdUser;
  }



  // =====================================================
  //                 EMPRESAS Y EMPLEOS (SQL)
  // =====================================================

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

