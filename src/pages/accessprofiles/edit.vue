<template>
  <Page Title="Editar Perfil de Acesso" :Breadcrumb="breadcrumb">
    <Card Title="Dados do Perfil" Icon="fas fa-id-card">
      <template #actions>
        <div class="row justify-end">
          <div class="col-12 col-md-4 q-py-xs-xs q-px-md-xs">
            <q-btn v-if="permissions.update" class="full-width" icon="fas fa-save" color="green" label="Salvar"
              @click="save()">
              <q-tooltip>Salvar dados</q-tooltip>
            </q-btn>
          </div>
          <div class="col-12 col-md-4 q-py-xs-xs q-px-md-xs">
            <q-btn v-if="permissions.delete" class="full-width" icon="fas fa-trash-alt" color="red" label="Excluir"
              @click="remove()">
              <q-tooltip>Excluir dados</q-tooltip>
            </q-btn>
          </div>
          <div class="col-12 col-md-4 q-py-xs-xs q-px-md-xs">
            <q-btn class="full-width" icon="fas fa-undo" color="grey-8" label="Voltar" @click="$router.go(-1)">
              <q-tooltip>Voltar à página anterior</q-tooltip>
            </q-btn>
          </div>
        </div>
      </template>

      <div class="row">
        <div class="col-12">
          <InputField Label="Título" Icon="fas fa-id-card" type="text" clearable v-model="input.ds_title"
            :Error="inputError.ds_title" @focus="inputError.ds_title = false" maxlength="40"></InputField>
        </div>
        <div class="col-12">
          <InputField Label="Descrição" Icon="fas fa-info-cricle" type="textarea" clearable
            v-model="input.tx_description">
          </InputField>
        </div>
      </div>

      <template #section-modules>
        <Card Title="Módulos do Perfil" Icon="fas fa-puzzle-piece">
          <q-option-group v-model="selectedModules" :options="moduleOptions" color="primary" type="checkbox" />
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
      permissions: {
        update: this.$iam.permissions.validatePermissions({ 'IAM_ACCESSPROFILE': 'U' }) && this.$iam.permissions.validatePermissions({ 'IAM_ACCESSPROFILE_MODULE': 'CRUD' }),
        delete: this.$iam.permissions.validatePermissions({ 'IAM_ACCESSPROFILE': 'D' }) && this.$iam.permissions.validatePermissions({ 'IAM_ACCESSPROFILE_MODULE': 'D' }),
      },
      modules: [],
      selectedModules: [],
      input: {
        ds_title: null,
        tx_description: null,
        do_active: null
      },
      inputError: {
        ds_title: false,
      }
    }
  },

  computed: {
    moduleOptions() {
      return this.modules.map(mod => ({
        label: mod.ds_title,
        value: mod.ds_key,
        checked: mod.checked === 'Y',
      }));
    },

    modulesSelected() {
      return {
        modules: this.modules.map(mod => {
          return {
            ds_key: mod.ds_key,
            ds_title: mod.ds_title,
            checked: this.selectedModules.includes(mod.ds_key) ? 'Y' : 'N',
            id_mdc_module: mod.id_mdc_module
          }
        })
      }
    },

    breadcrumb() {
      return [
        { label: 'Home', icon: "fas fa-home", to: "/" },
        { label: 'Perfis de Acesso', icon: "fas fa-id-card", to: "/iam/access-profiles" },
        { label: 'Editar' },
      ]
    }
  },

  methods: {
    async save() {
      if (!this.$toolcase.utils.validateForm(this.input, this.inputError)) return false;

      this.$emit('load', 'save-accessprofile');
      try {
        // Updates the profile's data:
        const profileResponse = await this.$http.put(`${this.$iam.ENDPOINTS.PROFILES.PROFILE}/${this.$route.params.key}`, this.input)

        // Updates the profile's selected modules:
        const modulesResponse = await this.$http.put(`${this.$iam.ENDPOINTS.PROFILES.MODULE}/${this.$route.params.key}`, this.modulesSelected);

        this.$router.push('/iam/access-profiles');
        this.$toolcase.utils.notify({
          message: "Os dados do perfil de acesso foram salvos com sucesso.",
          type: 'positive',
          position: 'top-right'
        });
      } catch (error) {
        this.$toolcase.utils.notifyError(error);
        console.error("An error has occurred while saving the access profile.", error);
      } finally {
        this.$emit('loaded', 'save-accessprofile');
      }
    },

    async remove() {
      if (!confirm('Deseja excluir as informações?')) return false;

      this.$emit('load', 'accessprofile-remove');

      try {
        await this.$http.delete(`${this.$iam.ENDPOINTS.PROFILES.PROFILE}/${this.$route.params.key}`);

        this.$toolcase.utils.notify({
          message: 'O perfil foi excluído com sucesso',
          type: 'positive',
          position: 'top-right'
        })
        this.$router.push('/iam/access-profiles');
      } catch (error) {
        this.$toolcase.utils.notifyError(error);
        console.error("An error has occurred while removing the access profile.", error);
      } finally {
        this.$emit('loaded', 'accessprofile-remove');
      }
    },

    async getModules() {
      try {
        const response = await this.$http.get(`${this.$iam.ENDPOINTS.PROFILES.MODULE}/${this.$route.params.key}`)
        this.modules = response.data;
        this.selectedModules = [];

        for (let i = 0; i < response.data.length; i++) {
          const mod = response.data[i];
          if (mod.checked == 'Y') {
            this.selectedModules.push(mod.ds_key);
          }
        }
      } catch (error) {
        this.$toolcase.utils.notifyError(error);
        console.error("An error has occurred while retrieving the modules.", error);
      }
    },

    async getProfileData() {
      // Get Access profile data:
      this.$emit('load', 'profile-data');
      try {
        const response = await this.$http.get(`${this.$iam.ENDPOINTS.PROFILES.PROFILE}/${this.$route.params.key}`);
        for (let k in this.input) {
          if (k in response.data)
            this.input[k] = response.data[k];
        }
        await this.getModules();
      } catch (error) {
        if (error.response.status == 404) {
          this.$toolcase.utils.notify({
            message: 'Perfil de acesso não encontrado.',
            type: 'negative',
            position: 'top-right'
          });
          this.$router.push('/iam/access-profiles');
          return;
        }
        this.$toolcase.utils.notifyError(error);
        console.error("An error has occurred on the attempt to retrieve user's data.", error);
      } finally {
        this.$emit('loaded', 'profile-data');
      }
    }
  },

  async mounted() {
    await this.$iam.auth.authenticate();

    if (!this.$iam.permissions.validatePermissions({ 'IAM_ACCESSPROFILE': 'R' }) ||
      !this.$iam.permissions.validatePermissions({ 'IAM_ACCESSPROFILE_MODULE': 'R' })) this.$router.push('/forbidden');

    this.getProfileData()
  },
}
</script>
