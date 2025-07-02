class Mage:
    def __init__(self, health =60, mana = 100):
        self.health = health
        self.mana = mana
        
    def introduce(self):
        print('-------------------------')
        print(f'Class: {self.__class__.__name__}',
              f'\nHealth: {self.health}',
              f'\nMana: {self.mana}')
        print('-------------------------')

    def heals(self, target):
        print('-------------------------')
        print(f'{self.__class__.__name__} casts a healing spell',
              f'to {target.__class__.__name__}')
        target.health += 10
        self.mana -= 20
        print(f'Health of {target.__class__.__name__} has been raised to {target.health}',
              f'\n{self.__class__.__name__} has {self.mana} mana left')
        print('-------------------------')

    def herbHealing(self,target):
        print('-------------------------')
        print(f'{self.__class__.__name__} uses a healing herb',
              f'to {target.__class__.__name__}')
        target.health += 5
        self.mana -= 20
        print(f'Health of {target.__class__.__name__} has been raised to {target.health}',
              f'\n{self.__class__.__name__} has {self.mana} stamina left')
        print('-------------------------')


Unit3 = Mage()
Unit3.introduce()
Unit3.heals(Unit3)
Unit3.herbHealing(Unit3)
