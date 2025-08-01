<template>
  <Page Title="Detalhes do Perfil de Acesso" :Breadcrumb="breadcrumb">
    <Card Title="Dados do Perfil" Icon="fas fa-id-card">
      <template #actions>
        <div class="row justify-end">
          <div class="col-12 col-md-4 q-py-xs-xs q-px-md-xs">
            <q-btn class="full-width" icon="fas fa-undo" color="grey-8" label="Voltar" @click="$router.go(-1)">
              <q-tooltip>Voltar à página anterior</q-tooltip>
            </q-btn>
          </div>
        </div>
      </template>

      <div class="row">
        <div class="col-12">
          <InputField Label="Título" Icon="fas fa-id-card" type="text" readonly v-model="userData.ds_title">
          </InputField>
        </div>
        <div class="col-12">
          <InputField Label="Descrição" Icon="fas fa-info-circle" type="textarea" readonly
            v-model="userData.tx_description">
          </InputField>
        </div>
      </div>

      <template #audit-info>
        <AuditInfo :input="userData"></AuditInfo>
      </template>

      <template #section-modules>
        <Card Title="Módulos do Perfil" Icon="fas fa-puzzle-piece">
          <q-option-group disable v-model="selectedModules" :options="modules" color="primary" type="checkbox" />
        </Card>
      </template>

    </Card>
  </Page>
</template>

<script>
export default {
  name: 'pages-iam-accessprofile-create',

  data() {
    return {
      userData: {},
      modules: [],
      selectedModules: [],
    }
  },

  computed: {
    breadcrumb() {
      return [
        { label: 'Home', icon: "fas fa-home", to: "/" },
        { label: 'Perfis de Acesso', icon: "fas fa-id-card", to: "/iam/access-profiles" },
        { label: 'Ver Detalhes' },
      ]
    }
  },

  methods: {
    getModules() {
      return this.$http.get(`${this.$iam.ENDPOINTS.PROFILES.MODULE}/${this.$route.params.key}`)
        .then((response) => {
          this.modules = [];
          this.selectedModules = [];

          for (let i = 0; i < response.data.length; i++) {
            let mod = response.data[i];
            this.modules.push({
              'label': mod.ds_title,
              'value': mod.ds_key
            })
            if (mod.checked == 'Y')
              this.selectedModules.push(mod.ds_key);
          }
        })
    },

    getProfileData() {
      // Get Access profile data:
      this.$emit('load', 'profile-data');
      this.$http.get(`${this.$iam.ENDPOINTS.PROFILES.PROFILE}/${this.$route.params.key}`)
        .then((response) => {
          this.userData = response.data;
        })
        .then(() => this.getModules())
        .catch((error) => {
          if (error.response.status == 404) {
            this.$toolcase.services.utils.notify({
              message: 'Perfil de acesso não encontrado.',
              type: 'negative',
              position: 'top-right'
            })
            this.$router.push('/iam/access-profiles');
            return;
          }
          this.$toolcase.services.utils.notifyError(error);
          console.error("An error has occurred on the attempt to retrieve user's data.", error);
        })
        .finally(() => {
          this.$emit('loaded', 'profile-data');
        });
    }
  },

  async mounted() {
    await this.$iam.services.auth.authenticate(this);
    if (!this.$iam.services.permissions.validatePermissions({ 'IAM_ACCESSPROFILE': 'R' }) ||
      !this.$iam.services.permissions.validatePermissions({ 'IAM_ACCESSPROFILE_MODULE': 'R' })) this.$router.push('/forbidden');

    this.getProfileData();
  },
}
</script>
